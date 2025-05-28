import { Heading, Highlight, HStack, VStack } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { ClaimStatusStepProps } from "./steps";
import { Serializer } from "@wharfkit/session";
import { edenAmountRe } from "../../utils/edenRegex";
import { Button } from "../Button";
import { Loading } from "../Loading";
import StepFrame from "./StepFrame";

function ClaimStatusStep({ input, onComplete, onBack }: ClaimStatusStepProps) {

  const eosAccount = useMemo(() => {
    return Serializer.objectify(input.session.actor);
  }, [input.session]);

  const [balance, setBalance] = useState<number | undefined>(0);

  useEffect(() => {
    const getBalance = async () => {
      const table = input.efContract.table("accounts", input.session.actor);

      const res = await table.get();
      if (res) {
        const balanceStr = Serializer.objectify(res.balance);
        console.log("balanceStr: ", balanceStr);
        const reExec = edenAmountRe.exec(balanceStr);
        if (reExec === null || reExec[1] === undefined) {
          throw new Error("Unable to parse balance");
        }
        const value = parseInt(reExec[1]);
        setBalance(value);
      } else {
        setBalance(0);
      }
    }

    // TODO: Check if proposal is already in progress or if already received claim

    getBalance();
        
  }, [eosAccount, input.efContract, input.session.actor]);

  const onBackClick = async () => {
    await input.sessionKit.logout();
    onBack({ ...input, session: undefined });
  }

  const onClaimClick = async () => {
    onComplete({ ...input, eosAccount, balance });
  }

  const onLogoutClick = async () => {
    await input.sessionKit.logout();
    onBack({ ...input, session: undefined });
  }

  const renderStatus = () => {
    if (balance === undefined) {
      return <Loading/>
    } else {
      if (balance === 0) {
        return (
         <VStack gap="2em" alignItems={"center"}>
            <Heading size="3xl" letterSpacing="tight">
              You don't have any Eden Fractal Respect.
            </Heading>
          </VStack>
        )
      } else {
        return (
          <VStack gap="2em" alignItems="center">
            <Heading size="3xl" letterSpacing="tight">
              <Highlight query="EDEN" styles={{ color: "blue.600" }}>
                {`${balance.toString()} EDEN`}
              </Highlight>
            </Heading>
            <HStack>
              <Button size="xl" onClick={onClaimClick}>Claim</Button>
            </HStack>
          </VStack>
        );
      }
    }
  }

  return (
    <StepFrame account={eosAccount} onLogout={onLogoutClick} onBack={onBackClick}>
      {renderStatus()}
    </StepFrame>
  )
}


export { ClaimStatusStep }