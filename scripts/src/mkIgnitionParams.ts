import { Command } from "commander";
import { version } from "../package.json";
import { z } from "zod";
import { readFileSync, writeFileSync } from "fs";
import { stringify } from "@ordao/ts-utils";
import { zBytes, zEthAddress } from "@ordao/ortypes";
import { zRespectHolders } from "./respectHolders";
import { buildMintRequests } from "./buildMintRequests";

export const zParentRespectCfg = z.object({
  uri: z.string().url(),
  contractURI: z.string().url(),
  setOwnerTo: zEthAddress.optional(),
  respectHolders: zRespectHolders,
  mintData: zBytes.optional()
});
export type OldRespectSetup = z.infer<typeof zParentRespectCfg>;

export const zDeployCfgBase = z.object({
  voteLength: z.number(),
  vetoLength: z.number(),
  voteThreshold: z.number(),
  maxLiveYesVotes: z.number(),
  ornodeOrigin: z.string().url(),
})
export type ContractDeployCfgBase = z.infer<typeof zDeployCfgBase>;

export const zParentOrecR1155Cfg = zDeployCfgBase.extend({
  parentRespect: zParentRespectCfg,
});
export type ParentOrecR1155Cfg = z.infer<typeof zParentOrecR1155Cfg>;

export const zParentFrOrecR1155Cfg = zDeployCfgBase;
export type ParentFrOrecR1155Cfg = z.infer<typeof zParentFrOrecR1155Cfg>;

export const zParentERC20OrecR1155Cfg = zDeployCfgBase;
export type ParentERC20OrecR1155Cfg = z.infer<typeof zParentFrOrecR1155Cfg>;

export const zDeployCfg = z.union([
  zParentOrecR1155Cfg,
  zParentFrOrecR1155Cfg,
  zParentERC20OrecR1155Cfg
]);
export type DeployCfg = z.infer<typeof zDeployCfg>;

export const zDeploymentRequest = z.union([
  z.object({
    module: z.literal("ParentOrecR1155"),
    cfg: zParentOrecR1155Cfg
  }),
  z.object({
    module: z.literal("ParentFrOrecR1155"),
    cfg: zParentFrOrecR1155Cfg
  }),
  z.object({
    module: z.literal("ParentERC20OrecR1155"),
    cfg: zParentERC20OrecR1155Cfg
  })
])
export type DeploymentRequest = z.infer<typeof zDeploymentRequest>;

// TODO: Add support for other modules. You will need different config objects
export const zModuleId = z.union([
  z.literal("ParentOrecR1155"),
  z.literal("ParentFrOrecR1155"),
  z.literal("ParentERC20OrecR1155")
]);
export type ModuleId = z.infer<typeof zModuleId>;

const program = new Command();

function _readCfg(path: string, module: ModuleId): DeploymentRequest {
  console.log("config path: ", path);
  const cfgObj = JSON.parse(readFileSync(path, 'utf-8'));
  console.log("read config: ", cfgObj);

  switch (module) {
    case "ParentOrecR1155": {
      const cfg = zParentOrecR1155Cfg.parse(cfgObj);
      return { module, cfg };
    }
    case "ParentFrOrecR1155": {
      const cfg = zParentFrOrecR1155Cfg.parse(cfgObj);
      return { module, cfg };
    }
    case "ParentERC20OrecR1155": {
      const cfg = zParentERC20OrecR1155Cfg.parse(cfgObj);
      return { module, cfg };
    }
  }
}

program
  .description("Create params for ignition deployment")
  .version(version)
  .argument("<deploy-cfg>", "Path to deployment configuration json")
  .argument("<module>", "For what ignition module to generate params for")
  .argument("<out>", "Where to put the output (ignition params json)")
  .showHelpAfterError()
  .action(async (deployCfg, moduleId, out, opts) => {
    const { module, cfg } = _readCfg(deployCfg, moduleId);

    let params: any = {
      ParentOrec: {
        votePeriod: cfg.voteLength,
        vetoPeriod: cfg.vetoLength,
        voteThreshold: cfg.voteThreshold,
        maxLiveYesVotes: cfg.maxLiveYesVotes
      },
      ParentOrecRespect1155: {
        uri: new URL("/v1/token/{id}", cfg.ornodeOrigin).href,
        contractURI: new URL("/v1/respectContractMetadata", cfg.ornodeOrigin).href
      },
    }

    switch (module) {
      case "ParentOrecR1155": {
        const mintRequests = buildMintRequests(cfg.parentRespect.respectHolders);
        params = {
          ...params,
          ParentRespect: {
            uri: cfg.parentRespect.uri,
            contractURI: cfg.parentRespect.contractURI,
            mintRequests,
            data: cfg.parentRespect.mintData
          }
        };
      }
    };

    writeFileSync(out, stringify(params));

    console.log("Wrote ignition params: ", out);
  })

program.parse()