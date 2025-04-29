import { Flex } from "@chakra-ui/react";
import { Proposal } from "@ordao/ortypes/orclient.js";
import { FullProposalCard } from "../proposal-view/FullProposalCard";

export interface ProposalViewProps {
  proposal: Proposal,
}

export function ProposalView({ proposal } : ProposalViewProps) {
  return (
    <Flex direction="column" gap={4}>
      <FullProposalCard proposal={proposal}/>
    </Flex>
  );
}