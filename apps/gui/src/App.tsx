// import { useState } from 'react'
// import './App.css'
import { deploymentInfo, orclientConfig } from "./global/config";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { config } from "./global/config.js";
import { useOrclient } from "@ordao/privy-react-orclient";
import { Box, Button, Center, Drawer, IconButton, Spinner,  useDisclosure } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppBar } from "./components/AppBar.js";
import { ProposalList } from "./components/ProposalList.js";
import { Menu as HamburgerIcon } from "lucide-react";
// import { Box, Center, Flex } from "@chakra-ui/react"



function App() {
  const [error, setError] = useState();
  if (error) {
    throw error;
  }
  const promiseRejectionHandler = useCallback((event: PromiseRejectionEvent) => {
    setError(event.reason);
  }, []);

  useEffect(() => {
    window.addEventListener("unhandledrejection", promiseRejectionHandler);

    return () => {
      window.removeEventListener("unhandledrejection", promiseRejectionHandler);
    };
  }, [promiseRejectionHandler]);

  const {
    login: privyLogin,
    logout: privyLogout,
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
  
  const orclient = useOrclient(deploymentInfo, userWallet, orclientConfig);

  useEffect(() => {
    console.log("login effect! authenticated: ", authenticated);
    if (privyReady && !authenticated) {
      console.log("logging in");
      privyLogin();
    }
  // Not adding privy's login to dependency list because it causes an infinite loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, userWallet, privyReady]);

  const login = useCallback(async () => {
    if (privyReady && authenticated) {
      await privyLogout();
    }
    privyLogin();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [privyLogout, authenticated, privyReady])

  // const { open: drawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const { open: drawerOpen, onOpen: onDrawerOpen } = useDisclosure();

  // const isSmallScreen = useBreakpointValue({ base: true, md: false });

  return (
    <>
      <AppBar
        title={config.appTitle}
        loggedInUser={userWallet?.address}
        onLogout={privyLogout}
        onLogin={privyLogin}
      />

      <Box display={{ base: "block", md: "none" }} position="fixed" right="0" top="0" zIndex="1">
        <IconButton
          onClick={() => onDrawerOpen()}
          aria-label="Open menu"
        >
          <HamburgerIcon />
        </IconButton>
      </Box>

      <Drawer.Root open={drawerOpen} placement="start">
        <Drawer.Content>
          <Button>Close</Button>
          <Drawer.Header>Menu</Drawer.Header>
          <Drawer.Body>
            <Button>Item1</Button>
            <Button>Item2</Button>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>

      <Box display={{ base: "none", md: "block" }} position="fixed" right="0" top="0" width="250px" height="100vh" bg="gray.100" p="4">
          <Button>Item1</Button>
          <Button>Item2</Button>
        {/* Add menu items here */}
      </Box>

      <Center minHeight="100vh" marginTop="6em" width="100%">
        {!privyReady ? (
          <Spinner size="xl" />
        ) : orclient && authenticated && userWallet ? (
          <ProposalList orclient={orclient} />
        ) : (
          <Button onClick={login} bg="black" color="white">
            Login
          </Button>
        )}
      </Center>
    </>
  );
}

export default App
