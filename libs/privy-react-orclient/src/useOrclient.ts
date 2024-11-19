import { useEffect, useState } from "react";
import { DeploymentSpec, createOrclient } from "@ordao/orclient/createOrclient.js";
import { ORClient, Config } from "@ordao/orclient";
import { ConnectedWallet } from "@privy-io/react-auth";

async function create(
  deployment: DeploymentSpec,
  wallet: ConnectedWallet,
  orclientCfg?: Config
): Promise<ORClient> {
  const provider = await wallet.getEthereumProvider();
  const orclient = await createOrclient(deployment, provider, orclientCfg);
  return orclient;
}

export function useOrclient(
  deployment?: DeploymentSpec,
  wallet?: ConnectedWallet,
  orclientConfig?: Config
) {
  const [orclient, setOrclient] = useState<ORClient | undefined>(undefined);

  useEffect(() => {
    // For seeing debug logs of orclient
    console.debug = console.log;

    if (deployment && wallet) {
      create(deployment, wallet, orclientConfig).then(
        orclient => setOrclient(orclient),
        err => console.error(err)
      );
    }
  }, [deployment, wallet]);

  return orclient;
}