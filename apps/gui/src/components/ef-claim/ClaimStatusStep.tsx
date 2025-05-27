import { Container } from "@chakra-ui/react";
import { useEffect } from "react";
import { ClaimStatusStepProps } from "./steps";
import { Serializer } from "@wharfkit/session";

function ClaimStatusStep({ input, onComplete }: ClaimStatusStepProps) {

  useEffect(() => {
    console.log("session: ", input.session);
    console.log("actor: ", Serializer.objectify(input.session.actor));
  }, [input.session]);

  return (
    <Container>

    </Container>
  )

}


export { ClaimStatusStep }