import { z } from "zod";
import { zEthAddress } from "@ordao/ortypes";
import { zMongoConfig, zOrnodeCfg, zSwaggerUICfg, zTokenMtCfg } from "@ordao/ortypes/config";

export const zConfig = z.object({
  oldRespectAddr: zEthAddress,
  voteLength: z.number(),
  vetoLength: z.number(),
  voteThreshold: z.number(),
  maxLiveYesVotes: z.number(),
  token: z.object({
    uri: z.string().url(),
    contractURI: z.string().url(),
    metadata: zTokenMtCfg
  }),
  ornodeService: z.object({
    providerUrl: z.string().url(),
    mongoCfg: zMongoConfig,
    ornode: zOrnodeCfg.default({}),
    logLevel: z.string()
  }),
  swaggerUIService: zSwaggerUICfg.default({})
})

