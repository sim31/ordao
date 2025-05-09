import { Button, Spinner, VStack, Text } from "@chakra-ui/react";
import { isORClient } from "@ordao/orclient";
import { usePrivy } from "@privy-io/react-auth";

export default function OrclienLoader({ children }: React.PropsWithChildren) {
  // const orclientSyncedWithPrivy = false;

  const {
    authenticated,
    logout: privyLogout,
    ready: privyReady,
  } = usePrivy();

  const orclient = useOrclient();

  const orclientUnsynced = privyReady && authenticated && !isORClient(orclient);

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
    return {children} 
  }

}