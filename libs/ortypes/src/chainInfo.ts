import { z } from "zod";
import { zBytes } from "./eth.js";

export const zNativeCurrency = z.object({
  name: z.string(),
  symbol: z.string(),
  decimals: z.number().int().gte(0)
});

export const ethCurrency = {
  symbol: "ETH",
  name: "Ethereum",
  decimals: 18
}

export const zChainInfo = z.object({
  chainId: zBytes,
  rpcUrls: z.array(z.string().url()),
  chainName: z.string(),
  blockExplorerUrl: z.string().url(),
  nativeCurrency: zNativeCurrency.default(ethCurrency)
});
export type ChainInfo = z.infer<typeof zChainInfo>;