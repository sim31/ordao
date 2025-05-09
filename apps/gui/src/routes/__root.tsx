import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { FaRankingStar } from 'react-icons/fa6'
import { FiHome } from 'react-icons/fi'
import { PiMedalFill, PiMedalThin } from 'react-icons/pi'
import { TbContract } from 'react-icons/tb'
import SidebarWithHeader, { AccountInfo, MenuItem } from '../components/app-frame/SidebarWithHeader'
// import { FaRegHandRock } from 'react-icons/fa'
// import { GiConfirmed } from 'react-icons/gi'
import { Button, Container, Flex, Spinner, Text, VStack } from '@chakra-ui/react'
import { isORClient } from '@ordao/orclient'
import { usePrivy } from '@privy-io/react-auth'
import { formatEthAddress } from "eth-address"
import { useEffect, useMemo } from 'react'
import { Toaster } from '../components/ui/toaster'
import { config } from '../global/config'
import { RouterContext } from '../global/routerContext'

const menuItems: Array<MenuItem> = [
  { id: "/", name: 'Proposals', icon: FiHome },
  { id: "/newProposal", name: 'New Proposal', icon: TbContract },
  // TODO:
  { id: "/submitBreakout/", name: 'Submit Breakout Results', icon: FaRankingStar },
  { id: "parentRespect", name: 'Parent Respect', icon: PiMedalFill, externalLink: config.parentRespectLink },
  { id: "childRespect", name: 'Child Respect', icon: PiMedalThin, externalLink: config.childRespectLink },
  // TODO:
  // { id: "claim", name: 'Claim parent Respect', icon: FaRegHandRock },
  // { id: "confirm", name: 'Confirm parent Respect', icon: GiConfirmed },
]

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  const { userWallet, orclient } = Route.useRouteContext();

  const {
    ready: privyReady,
    authenticated,
    login: privyLogin,
    logout: privyLogout
  } = usePrivy();

  useEffect(() => {
    console.log("login effect! authenticated: ", authenticated);
    if (privyReady && !authenticated) {
      console.log("logging in");
      privyLogin();
    }
  // Not adding privy's login to dependency list because it causes an infinite loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, userWallet, privyReady]);

  const login = async () => {
    if (privyReady && authenticated) {
      await privyLogout();
    }
    privyLogin();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  const accountInfo: AccountInfo | undefined = useMemo(() => {
    if (userWallet) {
      return {
        fullName: userWallet.address,
        displayName: formatEthAddress(userWallet.address),
      }
    }
  }, [userWallet]);

  const orclientUnsynced = privyReady && authenticated && !isORClient(orclient);
  // const orclientSyncedWithPrivy = false;

  const renderContent = () => {
    if (orclient === undefined) {
      return <Spinner />;
    } else if (orclientUnsynced) {
      return (
        <VStack>
          <Text>
            Something went wrong with wallet connection. Please try logging in again.
          </Text>
          <Button color="black" onClick={privyLogout}>
            Logout
          </Button>
        </VStack>
      )
    } else {
      return <Outlet />
    }
  }

  return (
    <Container minHeight="100vh" minWidth="100vw" padding="0px">
      <SidebarWithHeader
        accountInfo={accountInfo}
        onLogin={login}
        onLogout={privyLogout}
        menuItems={menuItems}
      >
        <Flex direction="column" gap={4}>
          {renderContent()}
        </Flex>
      </SidebarWithHeader>
      <Toaster />
      <TanStackRouterDevtools />
    </Container>
  )
}