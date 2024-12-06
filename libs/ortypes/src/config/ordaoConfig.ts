import { zChainInfo } from "src/chainInfo";
import { zEthAddress } from "src/eth";
import { z } from "zod";

export const zContractsAddrs = z.object({
  oldRespect: zEthAddress.optional(),
  newRespect: zEthAddress,
  orec: zEthAddress
});

export const zOrdaoConfig = z.object({
  contracts: zContractsAddrs,
  shortName: z.string().describe("Shortened name of this ORDAO instance"),
  fullName: z.string().describe("Full name / title of this ORDAO instance"),
  description: z.string().optional(),
  chainInfo: zChainInfo
})