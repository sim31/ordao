import { Center, VStack } from "@chakra-ui/react";
import { Text } from "../Text";
import { Button } from "../Button";
import { useEffect } from "react";
import { EosLoginStepProps } from "./steps";


export function EosLoginStep({ input, onComplete }: EosLoginStepProps) {
  useEffect(() => {
    if (input.session) {
      console.log("Already Have a session: ", input.session);
      onComplete({
        ...input,
        session: input.session,
        sessionKit: input.sessionKit
      })
    }
  }, [input, input.session, input.sessionKit, onComplete])

  const onLoginClick = async () => {
    const { session} = await input.sessionKit.login();

    onComplete({
      ...input,
      session,
      sessionKit: input.sessionKit
    })
  }

  return (
    <Center>
      <VStack gap="2em">
        <Text>Log in with your EOS account</Text>
        { input.session === undefined && <Button onClick={onLoginClick}>Log in</Button>}
      </VStack>
    </Center>
  )

}