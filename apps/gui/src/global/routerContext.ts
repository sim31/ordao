import { ORClientType } from "@ordao/orclient"
import { OrclientUndefined } from "@ordao/privy-react-orclient/backup-provider/useOrclient.js"
import { ConnectedWallet } from '@privy-io/react-auth'

export interface RouterContext {
  orclient?: ORClientType
  userWallet?: ConnectedWallet
  authenticated: boolean
  privyReady: boolean
}

export function assertOrclientBeforeLoad({ context }: {context: RouterContext }) {
  if (context.orclient === undefined) {
    throw new OrclientUndefined();
  }

  return { orclient: context.orclient };
}
