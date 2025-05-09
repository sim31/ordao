import { ORClientType } from "@ordao/orclient"
import { ConnectedWallet } from '@privy-io/react-auth'

export interface RouterContext {
  orclient?: ORClientType
  userWallet?: ConnectedWallet
  authenticated: boolean
  privyReady: boolean
}
