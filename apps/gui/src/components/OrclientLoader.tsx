import { Button, VStack, Text } from "@chakra-ui/react";
import { isORClient, ORClientType } from "@ordao/orclient";
import { useOrclient } from "@ordao/privy-react-orclient/backup-provider/useOrclient.js";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { Loading } from "./Loading";

export type OrclientLoaderProps = React.PropsWithChildren & {
  orclient?: ORClientType | null;
}

/**
 * Provides loading screen until orclient becomes available and handles case where user is logged in but orclient is not available..
 * 
 * If orclient is provided through props, it will be used instead of the one from context.
 * It's up to the external code to ensure access of the same orclient to children.
 */
export default function OrclientLoader({ children, orclient: propsOrclient }: OrclientLoaderProps) {
  const {
    authenticated,
    logout: privyLogout,
    ready: privyReady,
  } = usePrivy();

  const ctxOrclient = useOrclient();
  const orclient = propsOrclient !== undefined
    ? (propsOrclient === null ? undefined : propsOrclient)
    : ctxOrclient;

  const orclientUnsynced = privyReady && authenticated && !isORClient(orclient);

  const [relogin, setRelogin] = useState<boolean>(false);

  useEffect(() => {
    if (orclientUnsynced) {
      const timer = setTimeout(() => setRelogin(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [orclientUnsynced, setRelogin])

  useEffect(() => {
    if (relogin && !orclientUnsynced) {
      setRelogin(false);
    }
  }, [relogin, orclientUnsynced])

  if (orclient === undefined) {
    return <Loading />;
  } else if (relogin) {
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
    return <>{children}</>
  }

}