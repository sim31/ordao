import { BuildConfig, OldRespectSetup, zOldRespectSetup } from "./config";
import fs from "fs";
import path from "path";
import shelljs from "shelljs";
import { ChildProcError } from "./childProcError";
import { stringify } from "@ordao/ts-utils";
import { z } from "zod";
import { MintRequest, packTokenId, zInitialMintType } from "@ordao/ortypes/respect1155.js";
import { zBigNumberish, zBigNumberishToBigint, zEthAddress } from "@ordao/ortypes";

type ContractDeploymentType = "ExistingParent" | "ParentDeployed" | "ParentDeployedOwnershipTransferred";

type Module = {
  moduleList: string[],
  root: string
}
const moduleMap: Record<ContractDeploymentType, Module> = {
  "ExistingParent": {
    moduleList: ["Orec.ts", "OrecRespect1155.ts"],
    root: "OrecRespect1155.ts"
  },
  "ParentDeployed": {
    moduleList: [
      "ParentRespect.ts",
      "ParentOrec.ts",
      "ParentOrecRespect1155.ts"
    ],
    root: "ParentOrecRespect1155.ts"
  },
  "ParentDeployedOwnershipTransferred": {
    moduleList: [
      "ParentRespect.ts",
      "ParentOwnershipTransferred.ts",
      "ParentTrOrec.ts",
      "ParentTrOrecRespect1155.ts"
    ],
    root: "ParentTrOrecRespect1155.ts"
  }
};

export class Builder {
  private _cfg: BuildConfig;
  private _buildsPath: string;
  private _buildDir: string;
  private _contractsBuildSrc: string;
  private _orecBuildSrc: string;
  private _respectBuildSrc: string;
  private _origContractsSrc: string;
  private _tsConfigSrc: string;
  private _gitignoreSrc: string;
  private _ignitionSrc: string;
  private _ignitionModulesSrc: string;
  private _ignitionBuildSrc: string;
  private _ignitionModulesBuildSrc: string;
  private _ignitionBuildParams: string;
  private _ctype: ContractDeploymentType;

  constructor(cfg: BuildConfig, buildsPath: string) {
    this._cfg = cfg;
    this._buildsPath = buildsPath;
    const buildDir = path.join(this._buildsPath, this._cfg.name);
    if (fs.existsSync(buildDir)) {
      throw new Error("Build updates not implemented");
    } else {
      this._buildDir = buildDir;
      this._contractsBuildSrc = path.join(this._buildDir, "contracts");
      this._orecBuildSrc = path.join(this._contractsBuildSrc, "orec");
      this._respectBuildSrc = path.join(this._contractsBuildSrc, "respect1155");
    }

    this._origContractsSrc = path.join(__dirname, "../contracts-src/");
    this._tsConfigSrc = path.join(__dirname, "../tsconfig.json");
    this._gitignoreSrc = path.join(__dirname, "./gitignoreSrc.txt");
    this._ignitionSrc = path.join(__dirname, "../ignition");
    this._ignitionModulesSrc = path.join(this._ignitionSrc, "modules/");
    this._ignitionBuildSrc = path.join(this._buildDir, "ignition/");
    this._ignitionModulesBuildSrc = path.join(this._ignitionBuildSrc, "modules/");
    this._ignitionBuildParams = path.join(this._ignitionBuildSrc, "params.json");

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

  build() {
    this._initialBuild();
  }

  private _mkBuildDir() {
    fs.mkdirSync(this._buildDir);
  }

  private _mkDeployScript() {
    const rootModule = moduleMap[this._ctype].root;
    const rootModulePath = path.join(this._ignitionModulesBuildSrc, rootModule);
    const ignitionCmd = `npx hardhat ignition deploy ${rootModulePath} --parameters ${this._ignitionBuildParams} --network localhost`
    return ignitionCmd;
  }

  private _mkVerifyScript() {
    return 'echo \\"Not implemented yet\\"';
  }

  private _mkPackageJson() {
    const deployCmd = this._mkDeployScript();
    const verifyCmd = this._mkVerifyScript();

    const content = 
    `
    {
      "name": "${this._cfg.name}",
      "private": true,
      "version": "1.0.0",
      "description": "Contract deployment project for ${this._cfg.name} ORDAO",
      "author": "ordao-builder",
      "license": "GPL-3.0",
      "scripts": {
        "deploy": "${deployCmd}",
        "verify": "${verifyCmd}"
      },
      "devDependencies": {
        "hardhat": "^2.22.17",
        "@nomicfoundation/hardhat-ignition-ethers": "^0.15.8",
        "typescript": "^5.7.2",
        "@ordao/builder": "^1.0.0",
        "@ordao/ortypes": "^1.0.0"
      }
    }
    `

    fs.writeFileSync(path.join(this._buildDir, "package.json"), content);
  }

  private _mkHardhatConfig() {
    const deplCfg = this._cfg.contractDeployment;
    const etherscanCustomChain = deplCfg.etherscanCustomChain ?
    `
        customChains: [
          {
            network: "${deplCfg.etherscanCustomChain.networkName}",
            chainId: "${deplCfg.etherscanCustomChain.chainId}"
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

    fs.writeFileSync(path.join(this._buildDir, "hardhat.config.ts"), content);
  }

  private _mkContractsDir() {
    fs.cpSync(this._origContractsSrc, this._contractsBuildSrc, { recursive: true });
  }
  
  private _mkTsConfig() {
    fs.copyFileSync(this._tsConfigSrc, path.join(this._buildDir, 'tsconfig.json'));
  }

  private _mkGitignore() {
    fs.copyFileSync(this._gitignoreSrc, path.join(this._buildDir, ".gitignore"));
  }

  private _setupPackage() {
    // In parentheses to not change cwd of a parent process
    const cmd = `(cd ${this._buildDir} && npm install)`;
    const r = shelljs.exec(cmd);
    if (r.code !== 0) {
      throw new ChildProcError(cmd, r);
    }
  }

  private _buildContracts() {
    const cmd = `(cd ${this._buildDir} && npx hardhat compile)`;
    const r = shelljs.exec(cmd);
    if (r.code !== 0) {
      throw new ChildProcError(cmd, r);
    }
  }

  private _mkIgnitionModules() {
    fs.mkdirSync(this._ignitionModulesBuildSrc, { recursive: true });
    const modules = moduleMap[this._ctype].moduleList;
    for (const module of modules) {
      const p = path.join(this._ignitionModulesSrc, module);
      const dest = path.join(this._ignitionModulesBuildSrc, module);
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
      Orec: {
        votePeriod: deplCfg.voteLength,
        vetoPeriod: deplCfg.vetoLength,
        voteThreshold: deplCfg.voteThreshold,
        maxLiveYesVotes: deplCfg.maxLiveYesVotes
      },
      OrecRespect1155: {
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

  private _deployContracts() {
    const cmd = `(cd ${this._buildDir} && npm run deploy)`;
    const r = shelljs.exec(cmd);
    if (r.code !== 0) {
      throw new ChildProcError(cmd, r);
    }
  }

  private _initialBuild() {
    this._mkBuildDir();
    this._mkPackageJson();
    this._mkHardhatConfig();
    this._mkTsConfig()
    this._mkContractsDir();
    this._mkGitignore();
    this._mkIgnitionModules();
    this._mkIgnitionParams();

    this._setupPackage();
    this._buildContracts();

    this._deployContracts();
    // this._verifyContracts();
  }
}
