import { useEffect, useState } from "react";
import { DeploymentSpec, createOrclient, CreateOrclientConfig, createOrclientReader } from "@ordao/orclient/createOrclient.js";
import { ORClient } from "@ordao/orclient";
import { ConnectedWallet, usePrivy } from "@privy-io/react-auth";
import { ordaoLibVersions } from "./libVersions.js";
import { ORClientReader } from "@ordao/orclient/orclientReader.js";

function attachVersion(orclient: ORClientReader) {
  (orclient as any)['version'] = () => {
    console.log("versions: ", JSON.stringify(ordaoLibVersions, undefined, 2));
  }
  return orclient;

}

export async function create(
  deployment: DeploymentSpec,
  wallet: ConnectedWallet,
  orclientCfg?: CreateOrclientConfig
): Promise<ORClient> {
  console.log("Creating full orclient");
  const provider = await wallet.getEthereumProvider();
  const orclient = await createOrclient(deployment, provider, orclientCfg);
  // Change version function to include privy-react-orclient version
  attachVersion(orclient);
  return orclient;
}

export async function createReader(
  deployment: DeploymentSpec,
  providerUrl: string,
  orclientCfg?: CreateOrclientConfig
): Promise<ORClientReader> {
  console.log("Creating orclient reader");
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

/**
 * Returns an ORClientReader that is created only if the full
 * ORClient returned by useOrclient is undefined. Otherwise returns full ORClient
 *
 * @param {string} backupProviderURL The provider URL for the ORClientReader
 * @param {DeploymentSpec} [deployment] The deployment specification
 * @param {ConnectedWallet} [wallet] The connected wallet
 * @param {CreateOrclientConfig} [orclientConfig] The configuration for the ORClient
 * @param {number} [timeout] The timeout in milliseconds for when to create the backup. This is useful to give some time for wallet connections to happen needed for the full orclient 
 * @returns {ORClientReader | undefined}
 */
export function useOrclientWithBackup(
  backupProviderURL: string,
  deployment?: DeploymentSpec,
  wallet?: ConnectedWallet,
  orclientConfig?: CreateOrclientConfig,
  timeout: number = 3000
) {
  const [orclient, setOrclient] = useState<ORClientReader | undefined>(undefined);

  const { ready: privyReady } = usePrivy();

  const fullOrclient = useOrclient(deployment, wallet, orclientConfig);

  useEffect(() => {
    const createBackup = () => {
      if (fullOrclient === undefined && orclient === undefined) {
        createReader(deployment!, backupProviderURL, orclientConfig).then(
          orclient => {
            setOrclient(orclient);
            (window as any).orclient = orclient;
          },
          err => console.error(err)
        )      
      }
    }

    if (fullOrclient === undefined) {
      setTimeout(createBackup, timeout);
    }
  }, [fullOrclient, deployment, backupProviderURL, orclientConfig]);

  return orclient;
}
