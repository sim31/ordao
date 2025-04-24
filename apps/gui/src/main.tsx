import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from './components/ui/provider'
import { Container } from '@chakra-ui/react'
import './index.css'
// import BreakoutSubmitApp from './BreakoutSubmitApp'
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import Fallback from './components/app/Fallback'
import { PrivyProvider } from '@privy-io/react-auth'
import { config } from './global/config'
// import App from './App'
import SidebarWithHeader from './components/app/SidebarWithHeader'

console.debug = console.log;
console.debug("debug test")
console.log("log test")

// window.onerror = function myErrorHandler(errorMsg) {
//     alert("Error occured: " + errorMsg);
//     return false;
// }

// const logError = (error: Error, info: ErrorInfo) => {
//   console.error(stringify(error));
//   console.error("Error info", stringify(info));
// };

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<SidebarWithHeader />} errorElement={<Fallback />}/>
  )
);

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
          <RouterProvider router={router} />
        </Container>
      </Provider>
    </PrivyProvider>
  </React.StrictMode>
)