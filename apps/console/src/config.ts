import { zEthAddress, zUrl } from "@ordao/ortypes";
import { zChainInfo } from "@ordao/ortypes/chainInfo.js";
import { z } from "zod";

export const zContractsAddrs = z.object({
  oldRespect: zEthAddress.optional(),
  newRespect: zEthAddress,
  orec: zEthAddress
});
export type ContractsAddrs = z.infer<typeof zContractsAddrs>;

export const zConfig = z.object({
  contracts: zContractsAddrs,
  ornodeUrl: zUrl,
  appTitle: z.string(),
  chainInfo: zChainInfo
});
export type Config = z.infer<typeof zConfig>;

const oldRespect = process.env.OLD_RESPECT_ADDR;
const newRespect = process.env.NEW_RESPECT_ADDR;
const orec = process.env.OREC_ADDR;
const ornodeUrl = process.env.ORNODE_URL;
const appTitle = process.env.APP_TITLE;

const chainId = process.env.CHAIN_ID;
const rpcUrls = JSON.parse(process.env.RPC_URLS as string);
const chainName = process.env.CHAIN_NAME;
const blockExplorerUrl = process.env.BLOCKEXP_URL;

const cfgValues = {
  contracts: { oldRespect, newRespect, orec },
  ornodeUrl,
  appTitle,
  chainInfo: {
    chainId,
    rpcUrls,
    chainName,
    blockExplorerUrl
  }
}

console.log("Parsing config: ", cfgValues);

export const config = zConfig.parse(cfgValues);

console.debug("Loaded config: ", config);

