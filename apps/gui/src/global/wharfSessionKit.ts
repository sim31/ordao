// import { ChainId, ResolvedSigningRequest, Serializer, Session, SessionKit, Signature, SigningRequest, TransactArgs, TransactContext, Transaction, TransactionType, WalletPluginSignResponse } from "@wharfkit/session"
import { WebRenderer } from "@wharfkit/web-renderer"
import { WalletPluginAnchor } from "@wharfkit/wallet-plugin-anchor"
import { config } from "./config"
import SessionKit from "@wharfkit/session"
import {TransactPluginResourceProvider} from '@wharfkit/transact-plugin-resource-provider'

const webRenderer = new WebRenderer()

const walletPlugin = new WalletPluginAnchor()

export const sessionKit = new SessionKit({
  appName: config.appTitle,
  chains: [
    {
      id: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
      url: "https://eos.greymass.com",
    },
  ],
  ui: webRenderer,
  walletPlugins: [walletPlugin],
  },{
    transactPlugins: [new TransactPluginResourceProvider()]
  }
)
