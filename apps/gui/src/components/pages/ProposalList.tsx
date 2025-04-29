import { Flex } from "@chakra-ui/react";
import { ProposalCard } from "../proposal-view/ProposalCard";
import { proposals } from "../../global/testProps";

export function ProposalList() {
  return (
    <Flex direction="column" gap={4}>
      {proposals.map((prop) => (
        <ProposalCard key={prop.id} proposal={prop}/>
      ))}
    </Flex>
  );
}
