import { z } from "zod";
import { zEthAddress, zEthPrivateKey } from "@ordao/ortypes";
import { zMongoConfig, zOrnodeCfg, zSwaggerUICfg, zTokenMtCfg } from "@ordao/ortypes/config";

export const zOldRespectSetup = z.object({
  uri: z.string().url(),
  contractURI: z.string().url(),
  respectHolders: z.array(z.object({
    address: zEthAddress,
    amount: z.number().int().gt(0)
  }))
});

export const zNetwork = z.object({
  name: z.string(),
  url: z.string().url(),
  deployerKey: zEthPrivateKey,
  etherscan: z.object({
    etherscanNetworkName: z.string(),
    etherscanAPIKey: z.string()
  }).optional()
});

export const zEtherscanCustomChain = z.object({
  networkName: z.string(),
  chainId: z.number().int(),
  urls: z.object({
    apiURL: z.string().url(),
    browserURL: z.string().url()
  })
});

export const zContractDeployment = z.object({
  solidityVersion: z.string(),
  network: zNetwork,
  etherscanCustomChain: zEtherscanCustomChain.optional(),
  oldRespect: z.union([zEthAddress, zOldRespectSetup]),
  voteLength: z.number(),
  vetoLength: z.number(),
  voteThreshold: z.number(),
  maxLiveYesVotes: z.number(),
  ornodeOrigin: z.string().url(),
})

// TODO: add options for host and port of apps
export const zBuildConfig = z.object({
  name: z.string(),
  contractDeployment: zContractDeployment,
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

