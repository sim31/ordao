import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from './components/ui/provider'
import { Container } from '@chakra-ui/react'
import './index.css'
// import BreakoutSubmitApp from './BreakoutSubmitApp'
import { PrivyProvider } from '@privy-io/react-auth'
import { config } from './global/config'
// import App from './App'
import App from './components/App'

console.debug = console.log;
console.debug("debug test")
console.log("log test")


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
        <Container minHeight="100vh" minWidth="100vw" padding="0px">
          <App />
        </Container>
      </Provider>
    </PrivyProvider>
  </React.StrictMode>
)