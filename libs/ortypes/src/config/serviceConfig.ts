import { zOrdaoConfig } from "./ordaoConfig";
import { z } from "zod";
import { zTokenMtCfg } from "./tokenMtConfig";

export const zMongoConfig = z.object({
  url: z.string(),
  dbName: z.string()
});

export const zSwaggerUICfg = z.object({
  ornodeEndpoint: z.string().url().default("http://localhost:8090"),
  host: z.string().default("localhost"),
  port: z.number().default(9000)
});
export type SwaggerUICfg = z.infer<typeof zSwaggerUICfg>;

export const zSyncConfig = z.object({
  fromBlock: z.coerce.number().int().nonnegative(),
  toBlock: z.literal("latest").or(z.coerce.number().int().nonnegative()),
  // Logs cannot be queried for unlimited range of blocks (e.g.: https://github.com/ethers-io/ethers.js/issues/1798).
  // So we sync in steps of `stepRange` until we get from `fromBlock` to latest block
  stepRange: z.number().int().nonnegative().default(8000),
});
export type SyncConfig = z.infer<typeof zSyncConfig>;

export const zStoreConfig = z.object({
  defaultDocLimit: z.number().int().gt(0).default(50),
  maxDocLimit: z.number().int().gt(0).default(100)
})
export type StoreConfig = z.infer<typeof zStoreConfig>;

export const zProposalStoreConfig = zStoreConfig;
export type ProposalStoreConfig = z.infer<typeof zProposalStoreConfig>;

export const zAwardStoreConfig = zStoreConfig;
export type AwardStoreConfig = z.infer<typeof zAwardStoreConfig>;

export const zVoteStoreConfig = zStoreConfig;
export type VoteStoreConfig = z.infer<typeof zVoteStoreConfig>;

export const zOrnodeCfg = z.object({
  host: z.string().default("localhost"),
  port: z.number().default(8090),
  startPeriodNum: z.number().int().gte(0).default(0),
  proposalStore: zProposalStoreConfig.default({}),
  awardStore: zAwardStoreConfig.default({}),
  voteStore: zVoteStoreConfig.default({}),
  sync: zSyncConfig.optional(),
  listenForEvents: z.boolean().default(true)
})
export type OrnodeCfg = z.infer<typeof zOrnodeCfg>;

export const zServiceConfig = zOrdaoConfig.extend({
  service: z.object({
    providerUrl: z.string().url(),
    tokenMetadataCfg: zTokenMtCfg,
    mongoCfg: zMongoConfig,
    swaggerUI: zSwaggerUICfg.default({}), // Defaults used
    ornode: zOrnodeCfg.default({}) // Defaults used
  })
});
