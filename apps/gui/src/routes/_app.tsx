import { useUserWallet } from '@ordao/privy-react-orclient';
import { usePrivy } from '@privy-io/react-auth';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { formatEthAddress } from "eth-address";
import { useEffect, useMemo } from 'react';
import SidebarWithHeader, { AccountInfo } from '../components/app-frame/SidebarWithHeader';
import OrclientLoader from '../components/OrclientLoader';
import { menuItems } from '../global/menuItems';

export const Route = createFileRoute('/_app')({
  component: RouteComponent,
})

function RouteComponent() {
  const {
    ready: privyReady,
    authenticated,
    login: privyLogin,
    logout: privyLogout
  } = usePrivy();

  const userWallet = useUserWallet();

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

  const { orclient } = Route.useRouteContext();

  return (
      <SidebarWithHeader
        accountInfo={accountInfo}
        onLogin={login}
        onLogout={privyLogout}
        menuItems={menuItems}
      >
        <OrclientLoader orclient={orclient ?? null}>
          {/* // This is rendered only when orclient is defined */}
          <Outlet />
        </OrclientLoader>
      </SidebarWithHeader>
  );
}
