import { useEffect, useState } from "react";
import { DeploymentSpec, createOrclient, CreateOrclientConfig, createOrclientReader } from "@ordao/orclient/createOrclient.js";
import { ORClient } from "@ordao/orclient";
import { ConnectedWallet } from "@privy-io/react-auth";
import { ordaoLibVersions } from "./libVersions.js";
import { ORClientReader } from "@ordao/orclient/orclientReader.js";

function attachVersion(orclient: ORClientReader) {
  (orclient as any)['version'] = () => {
    console.log("versions: ", JSON.stringify(ordaoLibVersions, undefined, 2));
  }
  return orclient;

}

async function create(
  deployment: DeploymentSpec,
  wallet: ConnectedWallet,
  orclientCfg?: CreateOrclientConfig
): Promise<ORClient> {
  const provider = await wallet.getEthereumProvider();
  const orclient = await createOrclient(deployment, provider, orclientCfg);
  // Change version function to include privy-react-orclient version
  attachVersion(orclient);
  return orclient;
}

async function createReader(
  deployment: DeploymentSpec,
  providerUrl: string,
  orclientCfg?: CreateOrclientConfig
): Promise<ORClientReader> {
  const orclient = await createOrclientReader(deployment, providerUrl, orclientCfg);
  attachVersion(orclient);
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
  }, [deployment, wallet, orclientConfig]);

  return orclient;
}

export function useOrclientWithBackup(
  backupProviderURL: string,
  deployment?: DeploymentSpec,
  wallet?: ConnectedWallet,
  orclientConfig?: CreateOrclientConfig
) {
  const [orclient, setOrclient] = useState<ORClientReader | undefined>(undefined);

  const fullOrclient = useOrclient(deployment, wallet, orclientConfig);

  useEffect(() => {
    if (fullOrclient === undefined) {
      console.log("fullOrclient is undefined");
      createReader(deployment!, backupProviderURL, orclientConfig).then(
        orclient => {
          setOrclient(orclient);
          (window as any).orclient = orclient;
        },
        err => console.error(err)
      )      
    } else {
      console.log("fullOrclient is defined");
      setOrclient(fullOrclient);
      (window as any).orclient = fullOrclient;
    }
  }, [fullOrclient, deployment, backupProviderURL, orclientConfig]);

  return orclient;
}
