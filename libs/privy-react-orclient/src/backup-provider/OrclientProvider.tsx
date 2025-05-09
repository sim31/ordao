// ORClientProvider.tsx
import React, { createContext, useState, useEffect } from 'react';
import { ORClientType } from '@ordao/orclient';
import { useUserWallet } from 'src/useUserWallet';
import { useOrclientWithBackup } from 'src/useOrclient';
import { CreateOrclientConfig, DeploymentSpec } from '@ordao/orclient/createOrclient.js';

export interface OrclientContextType {
  orclient?: ORClientType;
}

export const OrclientBackupContext = createContext<OrclientContextType>({ orclient: undefined });

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
  const [orclient, setOrclient] =/*  */ useState<ORClientType | undefined>(undefined);

  const userWallet = useUserWallet();

  const value = useOrclientWithBackup(
    backupProviderURL,
    deployment,
    userWallet,
    orclientConfig,
    timeout
  );

  const Provider = OrclientBackupContext.Provider;

  return (
    <Provider value={{ orclient: value }}>
      {children}
    </Provider>
  );
};
