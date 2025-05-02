import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from './components/ui/provider'
import './index.css'
// import BreakoutSubmitApp from './BreakoutSubmitApp'
import { PrivyProvider } from '@privy-io/react-auth'
import { config } from './global/config'
import { RouterProvider, createRouter } from '@tanstack/react-router'
// Import the generated route tree
import { routeTree } from './routeTree.gen'
import Fallback from './components/Fallback'
import NotFoundError from './components/NotFound'

console.debug = console.log;
console.debug("debug test")
console.log("log test")

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultErrorComponent: Fallback,
  defaultNotFoundComponent: NotFoundError
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
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
        <RouterProvider router={router} />
      </Provider>
    </PrivyProvider>
  </React.StrictMode>
)