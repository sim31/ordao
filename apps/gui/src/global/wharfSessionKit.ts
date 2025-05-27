// import { ChainId, ResolvedSigningRequest, Serializer, Session, SessionKit, Signature, SigningRequest, TransactArgs, TransactContext, Transaction, TransactionType, WalletPluginSignResponse } from "@wharfkit/session"
import { WebRenderer } from "@wharfkit/web-renderer"
import { WalletPluginAnchor } from "@wharfkit/wallet-plugin-anchor"
import { config } from "./config"
import SessionKit from "@wharfkit/session"

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
})

// async function signTransaction(session: Session, transaction: TransactionType): Promise<Signature[]> {
//   try {
//     // Create a TransactContext for the WalletPlugin to use
//     const context = new TransactContext({
//       abiCache: session.abiCache,
//       chain: session.chain,
//       client: session.client,
//       createRequest: (args: TransactArgs) => session.createRequest(args, session.abiCache),
//       fetch: session.fetch,
//       permissionLevel: session.permissionLevel,
//       ui: session.ui
//     })
//     // Create a request based on the incoming transaction
//     const request = await SigningRequest.create(
//       {
//           transaction,
//           chainId: session.chain.id,
//       },
//       context.esrOptions
//     )
//     // Always set the broadcast flag to false on signing requests, Wharf needs to do it
//     request.setBroadcast(false)
//     // Resolve the request since the WalletPlugin expects a ResolvedSigningRequest
//     const resolvedRequest = new ResolvedSigningRequest(
//       request,
//       session.permissionLevel,
//       Transaction.from(transaction),
//       Serializer.objectify(Transaction.from(transaction)),
//       ChainId.from(session.chain.id)
//     )
//     // Request the signature from the WalletPlugin
//     const walletResponse: WalletPluginSignResponse = await session.walletPlugin.sign(
//       resolvedRequest,
//       context
//     )

//     if (session.ui) {
//       await session.ui.onTransactComplete();
//     }

//     // Return the array of signature
//     return walletResponse.signatures
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } catch (error: any) {
//     if (session.ui) {
//       await session.ui.onError(error)
//     }
//     throw error
//   }
// }

// async function main() {
//   console.log("This should be logged once");

//   const { session } = await sessionKit.login();

//   const eos = new APIClient({ url: "https://eos.greymass.com" });

//   const contractKit = new ContractKit({
//     client: eos
//   })
//   const contract = await contractKit.load("tadastadas25");
//   const action = contract.action("timestamp", { str: "test"});

//   // const res = await session.transact({ action });

//   // console.log("res: ", res);

//   const info = await eos.v1.chain.get_info();
//   const ref_block_num = info.last_irreversible_block_num.toNumber() & 0xffff;
//   const blockId = info.last_irreversible_block_id;
//   console.log("hex str: ", blockId.hexString, "str: ", blockId.toString());

//   const signature = await signTransaction(session, {
//     actions: [action],
//     ref_block_num,
//     ref_block_prefix: blockId.hexString.slice(0, 8),
//     expiration: new Date(Date.now() + 2 * 60 * 1000),

//   });
//   console.log("signature: ", signature[0]);

//   signature[0].verifyDigest

// }

// main();
