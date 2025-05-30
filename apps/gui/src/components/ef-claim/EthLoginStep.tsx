import { Center, Heading, HStack, VStack } from "@chakra-ui/react";
import { Text } from "../Text";
import { Button } from "../Button";
import { EthLoginStepProps } from "./steps";
import { usePrivy } from "@privy-io/react-auth";
import { isORClient } from "@ordao/orclient";
import { useUserWallet } from "@ordao/privy-react-orclient";
import StepFrame from "./StepFrame";
import { useOrclient } from "@ordao/privy-react-orclient/backup-provider/useOrclient.js";

export function EthLoginStep({ input, onComplete, onBack }: EthLoginStepProps) {
  const { login: privyLogin, logout: privyLogout } = usePrivy();
  const userWallet = useUserWallet();
  const orclient = useOrclient();

  const ethAddress = isORClient(orclient) ? userWallet?.address : undefined;

  const onLoginClick = async () => {
    await privyLogin();
  };

  const onEthLogoutClick = async () => {
    await privyLogout();
  };

  const onBackClick = () => {
    onBack({
      ...input,
      ethAddress: undefined,
      clickedClaim: undefined
    });
  }

  const onLogoutClick = async () => {
    await input.sessionKit.logout();
    onBack({ ...input, session: undefined, ethAddress: undefined, clickedClaim: undefined });
  }

  const onYesClick = () => {
    if (!isORClient(orclient)) {
      throw new Error("Programming error: orclient should only be clickable if it is full orclient");
    } else {
      onComplete({
        ...input,
        fullOrclient: orclient,
        ethAddress,
      });
    }
  };

  const onNoClick = async () => {
    await onEthLogoutClick();
    // back to alternative case
  };

  const render = () => {
    if (ethAddress) {
      return (
        <Center>
          <VStack gap="2em">
            <Heading size="2xl" letterSpacing="tight">
              Claim to account
            </Heading>
            <Text fontSize="2xl" letterSpacing="tight" wordBreak={"break-word"} color="blue.600">
              {ethAddress}
            </Text>
            <Heading size="2xl" letterSpacing="tight">
              on Base?
            </Heading>
            <HStack gap="1em" wrap="wrap">
              <Button size={{ base: "sm", md: "xl" }} onClick={onYesClick}>Yes</Button>
              <Button size={{ base: "sm", md: "xl" }} onClick={onNoClick}>No, use a different one</Button>
            </HStack>
          </VStack>
        </Center>
      );
    } else {
      return (
        <Center>
          <VStack gap="2em">
            <Text>Log in with account to which you want to claim your Respect on Base</Text>
            <Button size="xl" onClick={onLoginClick}>Log in</Button>
          </VStack>
        </Center>
      );
    }
  }

  return (
    <StepFrame
      account={input.eosAccount}
      onBack={onBackClick}
      onLogout={onLogoutClick}
    >
      {render()}
    </StepFrame>
  )
}