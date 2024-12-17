import { SeedConfig, OldRespectSetup, zOldRespectSetup } from "./config";
import fs from "fs";
import path from "path";
import shelljs from "shelljs";
import { ChildProcError } from "./childProcError";
import { stringify } from "@ordao/ts-utils";
import { z } from "zod";
import { MintRequest, packTokenId, zInitialMintType } from "@ordao/ortypes/respect1155.js";
import { zBigNumberish, zBigNumberishToBigint, zEthAddress } from "@ordao/ortypes";
import { ContractsAddrs, zContractsAddrs, ORSeed } from "@ordao/ortypes/orseed.js";
import prompt from "prompt-sync";

type ContractDeploymentType = "ExistingParent" | "ParentDeployed" | "ParentDeployedOwnershipTransferred";

type Module = {
  moduleList: string[],
  root: string
}
const moduleMap: Record<ContractDeploymentType, Module> = {
  "ExistingParent": {
    moduleList: ["Orec", "OrecRespect1155"],
    root: "OrecRespect1155"
  },
  "ParentDeployed": {
    moduleList: [
      "ParentRespect",
      "ParentOrec",
      "ParentOrecRespect1155"
    ],
    root: "ParentOrecRespect1155"
  },
  "ParentDeployedOwnershipTransferred": {
    moduleList: [
      "ParentRespect",
      "ParentOwnershipTransferred",
      "ParentTrOrec",
      "ParentTrOrecRespect1155"
    ],
    root: "ParentTrOrecRespect1155.ts"
  }
};

export class Seeder {
  private _cfg: SeedConfig;
  private _seedsPath: string;
  private _seedPath: string;
  private _seedContractsSrc: string;
  private _contractsSrc: string;
  private _tsConfigSrc: string;
  private _gitignoreSrc: string;
  private _ignitionSrc: string;
  private _ignitionModulesSrc: string;
  private _seedIgnitionSrc: string;
  private _seedIgnitionModulesSrc: string;
  private _ignitionBuildParams: string;
  private _seedOrecSrc: string;
  private _seedRespectSrc: string;
  private _ctype: ContractDeploymentType;

  constructor(cfg: SeedConfig, buildsPath: string) {
    this._cfg = cfg;
    this._seedsPath = buildsPath;
    this._seedPath = path.join(this._seedsPath, this._cfg.id);

    this._seedContractsSrc = path.join(this._seedPath, "contracts");
    this._seedOrecSrc = path.join(this._seedContractsSrc, "orec");
    this._seedRespectSrc = path.join(this._seedContractsSrc, "respect1155");

    this._contractsSrc = path.join(__dirname, "../contracts-src/");
    this._tsConfigSrc = path.join(__dirname, "../tsconfig.src.json");
    this._gitignoreSrc = path.join(__dirname, "./gitignoreSrc.txt");
    this._ignitionSrc = path.join(__dirname, "../ignition");
    this._ignitionModulesSrc = path.join(this._ignitionSrc, "modules/");
    this._seedIgnitionSrc = path.join(this._seedPath, "ignition/");
    this._seedIgnitionModulesSrc = path.join(this._seedIgnitionSrc, "modules/");
    this._ignitionBuildParams = path.join(this._seedIgnitionSrc, "params.json");

    const oldRespectSpec = this._cfg.contractDeployment.oldRespect;
    if (typeof oldRespectSpec === 'string') {
      this._ctype = "ExistingParent";
    } else {
      if (oldRespectSpec.setOwnerTo !== undefined) {
        this._ctype = "ParentDeployedOwnershipTransferred";
      } else {
        this._ctype = "ParentDeployed";
      }
    }

  }

  async create() {
    await this._create();
  }

  async deploy() {
    await this._deployContracts();
  }

  async verify() {
    await this._verifyContracts();
  }

  async showStatus() {
    await this._showStatus();
  }

  writeSeedDef() {
    this._writeSeedDef();
  }

  private _writeSeedDef() {
    console.log("Generating seed definition file..");
    const orseed = this._mkOrseedObj();
    const seedDefPath = path.join(this._seedPath, `${this._cfg.id}.seed.json`);
    fs.writeFileSync(seedDefPath, stringify(orseed));
    console.log("Wrote seed definition file: ", seedDefPath);
  }

  private _mkOrseedObj(): ORSeed {
    const cfg = this._cfg;
    return {
      id: cfg.id,
      fullName: cfg.fullName,
      description: cfg.description,
      contracts: this._readContractAddrs(),
      tokenMetadataCfg: cfg.token,
      chainInfo: cfg.contractConnection,
    }
  }

  private _readContractAddrs(): ContractsAddrs {
    const addrsPath = path.join(this._seedIgnitionSrc, `deployments/${this._cfg.id}/deployed_addresses.json`);
    const addrs = JSON.parse(fs.readFileSync(addrsPath, { encoding: 'utf-8'}));

    let r: unknown;
    switch (this._ctype) {
      case 'ExistingParent': {
        const oldRespect = zEthAddress.parse(this._cfg.contractDeployment.oldRespect);
        const orec = addrs["Orec#Orec"];
        const newRespect = addrs["OrecRespect1155#Respect1155"];
        r = { oldRespect, orec, newRespect };
        break;
      }
      case 'ParentDeployed': {
        const oldRespect = addrs["ParentRespect#Respect1155"];
        const orec = addrs["ParentOrec#Orec"];
        const newRespect = addrs["ParentOrecRespect1155#Respect1155"];
        r = { oldRespect, orec, newRespect };
        break;
      }
      case 'ParentDeployedOwnershipTransferred': {
        const oldRespect = addrs["ParentRespect#Respect1155"];
        const orec = addrs["ParentTrOrec#Orec"];
        const newRespect = addrs["ParentTrOrecRespect1155#Respect1155"];
        r = { oldRespect, orec, newRespect };
        break;
      }
    }
    return zContractsAddrs.parse(r);
  }


  private _mkBuildDir() {
    if (fs.existsSync(this._seedPath)) {
      console.log("Directory for seed already exists");
    } else {
      fs.mkdirSync(this._seedPath);
    }
  }

  private _mkDeployScript() {
    const rootModule = moduleMap[this._ctype].root;
    const rootModulePath = path.join(this._seedIgnitionModulesSrc, rootModule);
    const ignitionCmd = `npx hardhat ignition deploy ${rootModulePath}.ts --parameters ${this._ignitionBuildParams} --deployment-id ${this._cfg.id} --network ${this._cfg.contractDeployment.network.name}`
    return ignitionCmd;
  }

  private _mkVerifyScript() {
    const cmd = `npx hardhat verify ${this._cfg.id}`;
    return cmd;
  }

  private _mkStatusScript() {
    return `npx hardhat status ${this._cfg.id}`;
  }

  private _mkPackageJson() {
    const deployCmd = this._mkDeployScript();
    const verifyCmd = this._mkVerifyScript();
    const statusCmd = this._mkStatusScript();

    const content = 
    `
    {
      "name": "@ordao/${this._cfg.id}",
      "private": true,
      "version": "1.0.0",
      "description": "Contract deployment project for ${this._cfg.id} ORDAO",
      "author": "ordao-builder",
      "license": "GPL-3.0",
      "scripts": {
        "deploy": "${deployCmd}",
        "verify": "${verifyCmd}",
        "status": "${statusCmd}"
      },
      "devDependencies": {
        "hardhat": "^2.22.17",
        "@nomicfoundation/hardhat-ignition-ethers": "^0.15.8",
        "typescript": "^5.7.2",
        "@ordao/seeder": "^1.0.0",
        "@ordao/ortypes": "^1.0.0"
      }
    }
    `

    fs.writeFileSync(path.join(this._seedPath, "package.json"), content);
  }

  private _mkHardhatConfig() {
    const deplCfg = this._cfg.contractDeployment;
    const etherscanCustomChain = deplCfg.etherscanCustomChain ?
    `
        customChains: [
          {
            network: "${deplCfg.etherscanCustomChain.networkName}",
            chainId: ${deplCfg.etherscanCustomChain.chainId},
            urls: {
              apiURL: "${deplCfg.etherscanCustomChain.urls.apiURL}",
              browserURL: "${deplCfg.etherscanCustomChain.urls.browserURL}"
            }
          }
        ]
    ` : "";
    const etherscanContent = deplCfg.network.etherscan ?
    `
      etherscan: {
        apiKey: {
          ${deplCfg.network.etherscan.etherscanNetworkName}: "${deplCfg.network.etherscan.etherscanAPIKey}"
        },
        ${etherscanCustomChain}
      }
    ` : "";
    const content =
    `
    import { HardhatUserConfig } from "hardhat/config";
    import "@nomicfoundation/hardhat-toolbox";
    import "@nomicfoundation/hardhat-ignition-ethers";

    const config: HardhatUserConfig = {
      solidity: "0.8.24",
      networks: {
        ${deplCfg.network.name}: {
          url: "${deplCfg.network.url}",
          accounts: [
            "${deplCfg.network.deployerKey}",
          ]
        },
      },
      ${etherscanContent}
    };

    export default config;

    `

    fs.writeFileSync(path.join(this._seedPath, "hardhat.config.ts"), content);
  }

  private _mkContractsDir() {
    if (fs.existsSync(this._seedContractsSrc)) {
      fs.rmSync(this._seedContractsSrc, { recursive: true });
    }
    fs.cpSync(this._contractsSrc, this._seedContractsSrc, { recursive: true });
  }
  
  private _mkTsConfig() {
    fs.copyFileSync(this._tsConfigSrc, path.join(this._seedPath, 'tsconfig.json'));
  }

  private _mkGitignore() {
    fs.copyFileSync(this._gitignoreSrc, path.join(this._seedPath, ".gitignore"));
  }

  private async _setupPackage() {
    // In parentheses to not change cwd of a parent process
    await this._runFromSeedPath('npm install');
  }

  private async _buildContracts() {
    await this._runFromSeedPath("npx hardhat compile");
  }

  private _mkIgnitionModules() {
    if (!fs.existsSync(this._seedIgnitionModulesSrc)) {
      fs.mkdirSync(this._seedIgnitionModulesSrc, { recursive: true });
    }
    const modules = moduleMap[this._ctype].moduleList;
    for (const module of modules) {
      const p = path.join(this._ignitionModulesSrc, module + ".ts");
      const dest = path.join(this._seedIgnitionModulesSrc, module + ".ts");
      fs.copyFileSync(p, dest);
    }
  }

  private _buildMintRequests(cfg: OldRespectSetup): MintRequest[] {
    const mintRequests: MintRequest[] = [];
    for (const holder of cfg.respectHolders) {
      const id = packTokenId({
        owner: holder.address,
        mintType: zInitialMintType.value,
        periodNumber: 0
      })
      mintRequests.push({ 
        value: zBigNumberish.parse(holder.amount), 
        id: zBigNumberishToBigint.parse(id)
      });
    }

    return mintRequests;
  }

  private _mkIgnitionParams() {
    const deplCfg = this._cfg.contractDeployment;

    let params: any = {
      ParentOrec: {
        votePeriod: deplCfg.voteLength,
        vetoPeriod: deplCfg.vetoLength,
        voteThreshold: deplCfg.voteThreshold,
        maxLiveYesVotes: deplCfg.maxLiveYesVotes
      },
      ParentOrecRespect1155: {
        uri: new URL("/v1/token/{id}", deplCfg.ornodeOrigin).href,
        contractURI: new URL("/v1/respectContractMetadata", deplCfg.ornodeOrigin).href
      }
    };

    switch (this._ctype) {
      case 'ExistingParent': {
        const parentAddr = z.string().parse(deplCfg.oldRespect);
        params = {
          ...params,
          Orec: {
            ...params.Orec,
            parentAddr: parentAddr
          }
        };
        break;
      }
      case 'ParentDeployed': 
      case 'ParentDeployedOwnershipTransferred': {
        const parentSetup = zOldRespectSetup.parse(deplCfg.oldRespect);
        const mintRequests = this._buildMintRequests(parentSetup);
        params = {
          ...params,
          ParentRespect: {
            uri: parentSetup.uri,
            contractURI: parentSetup.contractURI,
            mintRequests,
            data: parentSetup.mintData
          }
        }
        if (this._ctype === 'ParentDeployedOwnershipTransferred') {
          const newOwner = zEthAddress.parse(parentSetup.setOwnerTo);
          params = {
            ...params,
            ParentOwnershiTransferred: {
              newOwner
            }
          }
        }
        break;
      }
    }
    
    fs.writeFileSync(this._ignitionBuildParams, stringify(params));
  }

  private async _runCommand(cmd: string) {
    const childProc = shelljs.exec(cmd, { async: true });
    if (childProc.stdin) {
      process.stdin.pipe(childProc.stdin);
    } else {
      console.warn("WARNING: child process does not have stdin");
    }
    return new Promise<void>((resolve, reject) => {
      childProc.on('error', (error) => {
        reject(new ChildProcError(cmd, error));
      })
      childProc.on('exit', (code) => {
        if (code !== 0) {
          reject(new ChildProcError(cmd, `exit code: ${code}`));
        } else {
          resolve();
        }
      })
    })
    
  }

  private async _runFromSeedPath(cmd: string) {
    const c = `(cd ${this._seedPath} && ${cmd})`;
    await this._runCommand(c);
  }

  private async _deployContracts() {
    console.log("Deploying...")
    await this._runFromSeedPath('npm run deploy');
  }

  private async _showStatus() {
    await this._runFromSeedPath('npm run status');
  }

  private async _verifyContracts() {
    await this._runFromSeedPath('npm run verify');
  }

  private async _create() {
    console.log("Creating / updating seed directory...");

    this._mkBuildDir();
    this._mkPackageJson();
    this._mkHardhatConfig();
    this._mkTsConfig()
    this._mkContractsDir();
    this._mkGitignore();
    this._mkIgnitionModules();
    this._mkIgnitionParams();

    await this._setupPackage();
    await this._buildContracts();
  }
}
