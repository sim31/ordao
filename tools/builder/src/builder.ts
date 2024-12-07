import { BuildConfig } from "./config";
import fs from "fs";
import path from "path";
import shelljs from "shelljs";
import { ChildProcError } from "./childProcError";

export class Builder {
  private _cfg: BuildConfig;
  private _buildsPath: string;
  private _buildDir: string;
  private _contractsSrcPath: string;
  private _orecSrcPath: string;
  private _respectSrcPath: string;
  private _origContractsSrc: string;
  private _tsConfigSrc: string;
  private _gitignoreSrc: string;

  constructor(cfg: BuildConfig, buildsPath: string) {
    this._cfg = cfg;
    this._buildsPath = buildsPath;
    const buildDir = path.join(this._buildsPath, this._cfg.name);
    if (fs.existsSync(buildDir)) {
      throw new Error("Build updates not implemented");
    } else {
      this._buildDir = buildDir;
      this._contractsSrcPath = path.join(this._buildDir, "contracts");
      this._orecSrcPath = path.join(this._contractsSrcPath, "orec");
      this._respectSrcPath = path.join(this._contractsSrcPath, "respect1155");

    }

    this._origContractsSrc = path.join(__dirname, "../contracts-src/");
    this._tsConfigSrc = path.join(__dirname, "../tsconfig.json");
    this._gitignoreSrc = path.join(__dirname, "./gitignoreSrc.txt");
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
        "typescript": "^5.7.2"
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
    fs.cpSync(this._origContractsSrc, this._contractsSrcPath, { recursive: true });
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

  private _initialBuild() {
    this._mkBuildDir();
    this._mkPackageJson();
    this._mkHardhatConfig();
    this._mkTsConfig()
    this._mkContractsDir();
    this._mkGitignore();
    // this._mkIgnitionModules();

    this._setupPackage();
    this._buildContracts();
    // this._deployContracts();
    // this._verifyContracts();
  }
}
