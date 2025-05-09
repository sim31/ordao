import React, { useEffect, useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider as ChakraProvider } from './components/ui/provider'
import './index.css'
// import BreakoutSubmitApp from './BreakoutSubmitApp'
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth'
import { RouterProvider, createRouter } from '@tanstack/react-router'
// Import the generated route tree
import Fallback from './components/Fallback'
import { Loading } from './components/Loading.js'
import NotFoundError from './components/NotFound'
import { config, deploymentInfo, orclientConfig } from "./global/config.js"
import { routeTree } from './routeTree.gen'
import { useOrclientWithBackup } from '@ordao/privy-react-orclient'
import { RouterContext } from './global/routerContext.js'

console.debug = console.log;
console.debug("debug test")
console.log("log test")

const defaultCtx: RouterContext = {
  authenticated: false,
  privyReady: false
} 

// Create a new router instance
const router = createRouter({
  routeTree,
  context: defaultCtx,
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
      <ORClientProvider>
        <ChakraProvider>
          <Main />
        </ChakraProvider>
      </ORClientProvider>
    </PrivyProvider>
  </React.StrictMode>
))

// eslint-disable-next-line react-refresh/only-export-components
function Main() {
  const {
    ready: privyReady,
    authenticated,
  } = usePrivy();

  const userWallet = useUserWallet();

  const orclient = useOrclient();

  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const [context, setContext] = useState<RouterContext | undefined>();

  useEffect(() => {
    const invalidateFn = async () => {
      console.log("Invalidating router");
      await router.invalidate({ sync: true });
      console.log("Invalidated router");
    }

    if (isMounted) {
      setContext({
        orclient,
        userWallet,
        authenticated,
        privyReady
      });
      invalidateFn();
    }
  }, [orclient, userWallet, authenticated, privyReady, isMounted])

  return <RouterProvider
    router={router}
    context={context ?? defaultCtx}
  />;
}
