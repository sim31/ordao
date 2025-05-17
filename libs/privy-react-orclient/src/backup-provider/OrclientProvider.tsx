import React, { createContext, useState, useEffect } from 'react';
import { ORClientType } from '@ordao/orclient';
import { useUserWallet } from '../useUserWallet.js';
import { useOrclientWithBackup } from '../useOrclient';
import { CreateOrclientConfig, DeploymentSpec } from '@ordao/orclient/createOrclient.js';

export interface OrclientContextType {
  orclient?: ORClientType;
}

export const OrclientContext = createContext<OrclientContextType>({ orclient: undefined });

export interface OrclientProviderProps {
  backupProviderURL: string;
  deployment: DeploymentSpec;
  orclientConfig: CreateOrclientConfig;
  timeout?: number;
  children: React.ReactNode;
}

export function OrclientProvider({
  children,
  deployment,
  backupProviderURL,
  orclientConfig,
  timeout
}: OrclientProviderProps) {
  const userWallet = useUserWallet();

  const value = useOrclientWithBackup(
    backupProviderURL,
    deployment,
    userWallet,
    orclientConfig,
    timeout
  );

  const Provider = OrclientContext.Provider;

  return (
    <Provider value={{ orclient: value }}>
      {children}
    </Provider>
  );
};
