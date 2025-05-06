import React, { useEffect, useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from './components/ui/provider'
import './index.css'
// import BreakoutSubmitApp from './BreakoutSubmitApp'
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth'
import { RouterProvider, createRouter } from '@tanstack/react-router'
// Import the generated route tree
import { routeTree } from './routeTree.gen'
import Fallback from './components/Fallback'
import NotFoundError from './components/NotFound'
import { deploymentInfo, orclientConfig, config } from "./global/config.js";
import { useOrclientWithBackup } from '@ordao/privy-react-orclient'
import { Loading } from './components/Loading.js'
import { AppContext } from './global/appContext.js'

console.debug = console.log;
console.debug("debug test")
console.log("log test")

const appContext = new AppContext();

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { appContext },
  defaultErrorComponent: Fallback,
  defaultNotFoundComponent: NotFoundError,
  defaultPendingComponent: Loading
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render((
  <React.StrictMode>
    <PrivyProvider
      appId={config.privyAppId || ""}
      config={{
        embeddedWallets: {
          // IMPORTANT: use this option if you don't want to deal with multiple wallets per user account
          // and you want to prefer external wallet if user has one.
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      <Provider>
        <App />
      </Provider>
    </PrivyProvider>
  </React.StrictMode>
))

// eslint-disable-next-line react-refresh/only-export-components
function App() {
  const {
    ready: privyReady,
    user,
    authenticated
  } = usePrivy();
  const conWallets = useWallets();
  // TODO: should figure out how to deal with multiple wallets.
  // User should be able to select one of them.
  const userWallet = useMemo(() =>{
    if (privyReady && authenticated && conWallets && conWallets.ready) {
      return conWallets.wallets.find(w => w.address === user?.wallet?.address);
    }
  }, [user, conWallets, privyReady, authenticated]);
  
  const orclient = useOrclientWithBackup(
    config.chainInfo.rpcUrls[0],
    deploymentInfo,
    userWallet,
    orclientConfig
  );

  useEffect(() => {
    const prevOrclient = appContext.getOrclientSync();
    console.log("prevOrclient: ", prevOrclient, ", orclient: ", orclient);
    let invalidate: boolean = false;

    const prevPrivyReady = appContext.getPrivyReadSync();
    if (prevPrivyReady !== privyReady) {
      appContext.setPrivyReady(privyReady);
      invalidate = true;
    }

    const prevUserWallet = appContext.getPrivyWalletSync();
    if (prevUserWallet !== userWallet) {
      appContext.setPrivyWallet(userWallet);
      invalidate = true;
    }

    if (prevOrclient !== orclient) {
      appContext.setOrclient(orclient);
      invalidate = true;
    }

    if (invalidate) {
      console.log("invalidating router context");
      router.invalidate();
    }

  }, [privyReady, orclient, userWallet]);

  return <RouterProvider router={router} />;
}
