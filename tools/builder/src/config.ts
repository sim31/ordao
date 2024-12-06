import { z } from "zod";
import { zEthAddress } from "@ordao/ortypes";
import { zMongoConfig, zOrnodeCfg, zSwaggerUICfg, zTokenMtCfg } from "@ordao/ortypes/config";

export const zOldRespectSetup = z.object({
  uri: z.string().url(),
  contractURI: z.string().url(),
  respectHolders: z.array(z.object({
    address: zEthAddress,
    amount: z.number().int().gt(0)
  }))
});

// TODO: add options for host and port of apps
// TODO: deployer
export const zBuildConfig = z.object({
  oldRespect: z.union([zEthAddress, zOldRespectSetup]),
  voteLength: z.number(),
  vetoLength: z.number(),
  voteThreshold: z.number(),
  maxLiveYesVotes: z.number(),
  ornodeOrigin: z.string().url(),
  token: zTokenMtCfg,
  ornodeService: z.object({
    providerUrl: z.string().url(),
    mongoCfg: zMongoConfig,
    ornode: zOrnodeCfg.default({}),
    logLevel: z.string().default("info")
  }),
  swaggerUIService: zSwaggerUICfg.default({})
})

export type BuildConfig = z.infer<typeof zBuildConfig>;

