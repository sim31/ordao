import { zContractMetadata } from "src/erc7572";
import { zRespectFungibleMt } from "src/respect1155";
import z from "zod";

export const zTokenMtCfg = z.object({
  award: z.object({
    name: z.string(),
    description: z.string().optional(),
    image: z.string().url().optional(),
  }),
  fungible: zRespectFungibleMt,
  contract: zContractMetadata
}).describe("Token metadata config");
