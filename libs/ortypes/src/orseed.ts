import { zChainInfo } from "./chainInfo";
import { zContractMetadata } from "./erc7572";
import { zEthAddress } from "./eth";
import { zRespectFungibleMt } from "./respect1155";
import z from "zod";

/**
 * seed - instance of an onchain contract (deployed contract)
 * orseed - deployed instance of ordao contract
 */

export const zTokenMtCfg = z.object({
  award: z.object({
    name: z.string(),
    description: z.string().optional(),
    image: z.string().url().optional(),
  }),
  fungible: zRespectFungibleMt,
  contract: zContractMetadata
}).describe("Token metadata config");

export const zContractsAddrs = z.object({
  oldRespect: zEthAddress,
  newRespect: zEthAddress,
  orec: zEthAddress
});
export type ContractsAddrs = z.infer<typeof zContractsAddrs>;

export const zORSeed = z.object({
  id: z.string().describe("Short identifier for this seed."),
  fullName: z.string().describe("Full name / title of this seed."),
  description: z.string().optional(),
  contracts: zContractsAddrs,
  tokenMetadataCfg: zTokenMtCfg,
  chainInfo: zChainInfo
})
export type ORSeed = z.infer<typeof zORSeed>;
