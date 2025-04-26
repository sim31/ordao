import { Center } from "@chakra-ui/react";
import { ReactNode } from "react";

export interface ProposalFormProps {
  children: ReactNode // form
}

export function ProposalForm({ children }: ProposalFormProps) {
  return (
    <Center width="100%">
      {children}
    </Center>
  )
}