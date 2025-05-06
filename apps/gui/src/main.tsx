import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from './components/ui/provider'
import './index.css'
// import BreakoutSubmitApp from './BreakoutSubmitApp'
import { PrivyProvider } from '@privy-io/react-auth'
import { RouterProvider, createRouter } from '@tanstack/react-router'
// Import the generated route tree
import Fallback from './components/Fallback'
import { Loading } from './components/Loading.js'
import NotFoundError from './components/NotFound'
import { AppContext } from './global/appContext.js'
import { config } from "./global/config.js"
import { routeTree } from './routeTree.gen'

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
  return <RouterProvider router={router} />;
}
