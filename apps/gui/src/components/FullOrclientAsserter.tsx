import { Center } from "@chakra-ui/react";
import { Button } from "./Button";
import { isORClient, ORClientType } from "@ordao/orclient";
import { useAssertOrclient } from "@ordao/privy-react-orclient/backup-provider/useOrclient.js";
import { usePrivy } from "@privy-io/react-auth";

export type FullOrclientAsserterProps = React.PropsWithChildren & { 
  orclient?: ORClientType;
}

/**
 * If full orclient is not present, show login button. Else render children.
 * 
 * Assumes that some form of orclient is already loaded and ensured, using OrclientLoader component or some other mechanism.
 * 
 * If orclient is provided through props, it will be used instead of the one from context.
 * It's up to the external code to ensure access of the same orclient to children.
 */
export default function FullOrclientAsserter({ children, orclient: propsOrclient }: FullOrclientAsserterProps) {
  const { login: privyLogin } = usePrivy();

  const ctxOrclient = useAssertOrclient();
  const orclient = propsOrclient !== undefined
    ? propsOrclient
    : ctxOrclient;

  const fullOrclient = isORClient(orclient);

  if (!fullOrclient) {
    return (
      <Center>
        <Button size="xl" onClick={privyLogin}>Login</Button>
      </Center>
    );
  } else {
    return (
      <>{children}</>
    )
  }
}