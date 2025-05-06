import { createRootRouteWithContext,  Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import SidebarWithHeader, { AccountInfo, MenuItem } from '../components/app-frame/SidebarWithHeader'
import { FiHome } from 'react-icons/fi'
import { FaRankingStar } from 'react-icons/fa6'
import { TbContract } from 'react-icons/tb'
import { PiMedalFill, PiMedalThin } from 'react-icons/pi'
// import { FaRegHandRock } from 'react-icons/fa'
// import { GiConfirmed } from 'react-icons/gi'
import { Container, Flex } from '@chakra-ui/react'
import { config } from '../global/config'
import { Toaster } from '../components/ui/toaster'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useEffect, useMemo } from 'react'
import { formatEthAddress } from "eth-address";
import { AppContext } from '../global/appContext'

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

export interface RouterContext {
  appContext: AppContext,
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent
})

function RootComponent() {
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

  return (
    <Container minHeight="100vh" minWidth="100vw" padding="0px">
      <SidebarWithHeader
        accountInfo={accountInfo}
        onLogin={login}
        onLogout={privyLogout}
        menuItems={menuItems}
        selectedMenuItemId={"proposals"}
      >
        <Flex direction="column" gap={4}>
          <Outlet />
        </Flex>
      </SidebarWithHeader>
      <Toaster />
      <TanStackRouterDevtools />
    </Container>
  )
}