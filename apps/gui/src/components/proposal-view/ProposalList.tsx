import { Flex } from "@chakra-ui/react";
import { ProposalCard } from "./ProposalCard";
import { Proposal } from "@ordao/orclient";

export interface ProposalListProps {
  proposals: Proposal[]

}

export function ProposalList({ proposals }: ProposalListProps) {
  return (
    <Flex direction="column" gap={4}>
      {proposals.map((prop) => (
        <ProposalCard key={prop.id} proposal={prop}/>
      ))}
    </Flex>
  );
}
