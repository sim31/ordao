import { BuildConfig } from "./config";
import fs from "fs";
import path from "path";
import shelljs from "shelljs";
import { ChildProcError } from "./childProcError";
import { stringify } from "@ordao/ts-utils";

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
  private _ignitionBuildSrc: string;
  private _ignitionBuildParams: string;

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
    this._ignitionBuildSrc = path.join(this._buildDir, "ignition/");
    this._ignitionBuildParams = path.join(this._ignitionBuildSrc, "params.json");
  }

  build() {
    this._initialBuild();
  }

  private _mkBuildDir() {
    fs.mkdirSync(this._buildDir);
  }

  private _mkPackageJson() {
    const content = 
    `
    {
      "name": "${this._cfg.name}",
      "private": true,
      "version": "1.0.0",
      "description": "Contract deployment project for ${this._cfg.name} ORDAO",
      "author": "ordao-builder",
      "license": "GPL-3.0",
      "devDependencies": {
        "hardhat": "^2.22.17",
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
    import "dotenv/config";

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
    fs.cpSync(this._ignitionSrc, this._ignitionBuildSrc, { recursive: true });
  }

  private _mkIgnitionParams() {
    const deplCfg = this._cfg.contractDeployment;
    const params = {
      OldRespect: {
        oldRespect: deplCfg.oldRespect
      },
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
    
    fs.writeFileSync(this._ignitionBuildParams, stringify(params));
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
    // this._deployContracts();
    // this._verifyContracts();
  }
}
