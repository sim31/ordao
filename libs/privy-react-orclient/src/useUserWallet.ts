import { ConnectedWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import { useMemo, useState } from "react";

export function useUserWallet(): ConnectedWallet | undefined {
  const {
    ready: privyReady,
    user,
    authenticated,
  } = usePrivy();
  const conWallets = useWallets();
  // TODO: should figure out how to deal with multiple wallets.
  // User should be able to select one of them.
  const userWallet = useMemo(() =>{
    if (privyReady && authenticated && conWallets && conWallets.ready) {
      return conWallets.wallets.find(w => w.address === user?.wallet?.address);
    }
  }, [user, conWallets, privyReady, authenticated]);

  return userWallet;
}
