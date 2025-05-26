import { zEthAddress, zUrl } from "@ordao/ortypes";
import { zChainInfo } from "@ordao/ortypes/chainInfo.js";
import { z } from "zod";
import { CreateOrclientConfig, DeploymentInfo } from "@ordao/orclient/createOrclient.js"
import { defaultConfig } from "@ordao/orclient";

export const zContractsAddrs = z.object({
  newRespect: zEthAddress,
  orec: zEthAddress
});
export type ContractsAddrs = z.infer<typeof zContractsAddrs>;

export const zConfig = z.object({
  contracts: zContractsAddrs,
  ornodeUrl: zUrl,
  appTitle: z.string(),
  chainInfo: zChainInfo,
  privyAppId: z.string(),
  docsOrigin: z.string().url(),
  parentRespectLink: z.string().url(),
  respectGameLink: z.string().url(),
  defaultPropQuerySize: z.coerce.number().int().gt(0).default(6),
  fractalDocsUrl: z.string().url().optional()
});
export type Config = z.infer<typeof zConfig>;

const newRespect = import.meta.env.VITE_NEW_RESPECT_ADDR;
const orec = import.meta.env.VITE_OREC_ADDR;
const ornodeUrl = import.meta.env.VITE_ORNODE_URL;
const appTitle = import.meta.env.VITE_APP_TITLE;
const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;
const docsOrigin = import.meta.env.VITE_DOCS_ORIGIN;
const parentRespectLink = import.meta.env.VITE_PARENT_RESPECT_LINK;
const respectGameLink = import.meta.env.VITE_RESPECT_GAME_LINK;
const defaultPropQuerySize = import.meta.env.VITE_DEFAULT_PROP_QUERY_SIZE;
const fractalDocsUrl = import.meta.env.VITE_FRACTAL_DOCS_URL;

const chainId = import.meta.env.VITE_CHAIN_ID;
const rpcUrls = import.meta.env.VITE_RPC_URLS.split(",");
const chainName = import.meta.env.VITE_CHAIN_NAME;
const blockExplorerUrl = import.meta.env.VITE_BLOCKEXP_URL;

export const config = zConfig.parse({
  contracts: {
    newRespect, orec
  },
  ornodeUrl,
  appTitle,
  chainInfo: {
    chainId,
    rpcUrls,
    chainName,
    blockExplorerUrl
  },
  privyAppId,
  docsOrigin,
  parentRespectLink,
  respectGameLink,
  defaultPropQuerySize,
  fractalDocsUrl
});

export const orclientConfig: CreateOrclientConfig = {
  ...defaultConfig,
  consoleConfig: { enabled: true, docsOrigin: docsOrigin }
};

export const deploymentInfo: DeploymentInfo = {
  ...config,
  title: appTitle
};

console.log("Loaded config: ", config);

