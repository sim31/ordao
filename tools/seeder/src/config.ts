import { z } from "zod";
import { zBytes, zEthAddress, zEthPrivateKey } from "@ordao/ortypes";
import { zMongoConfig, zOrnodeCfg, zSwaggerUICfg, zTokenMtCfg } from "@ordao/ortypes/config";
import { zChainInfo } from "@ordao/ortypes/chainInfo.js";

export const zOldRespectSetup = z.object({
  uri: z.string().url(),
  contractURI: z.string().url(),
  setOwnerTo: zEthAddress.optional(),
  respectHolders: z.array(z.object({
    address: zEthAddress,
    amount: z.number().int().gt(0)
  })),
  mintData: zBytes.optional()
});
export type OldRespectSetup = z.infer<typeof zOldRespectSetup>;

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

export const zSeedConfig = z.object({
  id: z.string().describe("Short identifier for this seed."),
  fullName: z.string().describe("Full name / title of this seed."),
  description: z.string().optional(),
  contractDeployment: zContractDeployment,
  contractConnection: zChainInfo,
  token: zTokenMtCfg,
})

export type SeedConfig = z.infer<typeof zSeedConfig>;
