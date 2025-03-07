import { useEffect, useState } from "react";
import { DeploymentSpec, createOrclient, CreateOrclientConfig } from "@ordao/orclient/createOrclient.js";
import { ORClient } from "@ordao/orclient";
import { ConnectedWallet } from "@privy-io/react-auth";
import { ordaoLibVersions } from "./libVersions.js";

async function create(
  deployment: DeploymentSpec,
  wallet: ConnectedWallet,
  orclientCfg?: CreateOrclientConfig
): Promise<ORClient> {
  const provider = await wallet.getEthereumProvider();
  const orclient = await createOrclient(deployment, provider, orclientCfg);
  // Change version function to include privy-react-orclient version
  (orclient as any)['version'] = () => {
    console.log("versions: ", JSON.stringify(ordaoLibVersions, undefined, 2));
  }
  return orclient;
}

export function useOrclient(
  deployment?: DeploymentSpec,
  wallet?: ConnectedWallet,
  orclientConfig?: CreateOrclientConfig
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
    } else if (orclient !== undefined) {
      setOrclient(undefined);
    }
  }, [deployment, wallet]);

  return orclient;
}