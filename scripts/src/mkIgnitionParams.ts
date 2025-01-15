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

export const zDeployCfg = z.object({
  parentRespect: zParentRespectCfg,
  voteLength: z.number(),
  vetoLength: z.number(),
  voteThreshold: z.number(),
  maxLiveYesVotes: z.number(),
  ornodeOrigin: z.string().url(),
})
export type ContractDeployCfg = z.infer<typeof zDeployCfg>;

// TODO: Add support for other modules. You will need different config objects
export const zModule = z.literal("ParentOrecRespect1155");

const program = new Command();

program
  .description("Create params for ignition deployment")
  .version(version)
  .argument("<deploy-cfg>", "Path to deployment configuration json")
  .argument("<module>", "For what ignition module to generate params for")
  .argument("<out>", "Where to put the output (ignition params json)")
  .showHelpAfterError()
  .action(async (deployCfg, module, out, opts) => {
    const moduleName = zModule.parse(module);
    console.log("Generating ignition params for module: ", moduleName);
    console.log("config path: ", deployCfg);
    const cfgObj = JSON.parse(readFileSync(deployCfg, 'utf-8'));
    console.log("read config: ", cfgObj);
    const cfg = zDeployCfg.parse(cfgObj);
    console.log("Parsed config");

    const mintRequests = buildMintRequests(cfg.parentRespect.respectHolders);

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
      ParentRespect: {
        uri: cfg.parentRespect.uri,
        contractURI: cfg.parentRespect.contractURI,
        mintRequests,
        data: cfg.parentRespect.mintData
      }
    };

    writeFileSync(out, stringify(params));

    console.log("Wrote ignition params: ", out);
  })

program.parse()