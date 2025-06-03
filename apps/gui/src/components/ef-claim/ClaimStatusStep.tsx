import { Heading, Highlight, HStack, VStack } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
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

      // FOR TESTING
      // if (eosAccount === "tadastadas24") {
      //   setBalance(100);
      //   return;
      // }

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

    const run = async () => {
      await getBalance();
    }

    run();
        
  }, [eosAccount, input.efContract, input.session.actor, input.clickedClaim]);

  // TODO: Check if proposal is already in progress or if already received claim
  // TODO: check if requestTxId is already stored

  const complete = useCallback(() => {
    onComplete({ ...input, eosAccount, balance, clickedClaim: true });
  }, [input, onComplete, eosAccount, balance]);


  useEffect(() => {
    const shouldProceed = () => {
      return input.clickedClaim
        && eosAccount !== undefined
        && balance !== undefined
        && balance > 0;
    }

    if (shouldProceed()) {
      complete();
    }
  }, [input.clickedClaim, eosAccount, balance, input.requestTxId, complete]);

  const onBackClick = async () => {
    await input.sessionKit.logout();
    onBack({ ...input, session: undefined, clickedClaim: undefined });
  }

  const onClaimClick = async () => {
    complete();
  }

  const onLogoutClick = async () => {
    await input.sessionKit.logout();
    onBack({ ...input, session: undefined, clickedClaim: undefined });
  }

  const renderStatus = () => {
    if (balance === undefined) {
      return <Loading/>
    } else {
      if (balance === 0) {
        return (
         <VStack gap="2em" alignItems={"center"}>
            <Heading size={{ base: "lg", md: "2xl" }} letterSpacing="tight" wordBreak={"break-word"}>
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