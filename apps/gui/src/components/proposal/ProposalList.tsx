import { Flex } from "@chakra-ui/react";
import { ORClient } from "@ordao/orclient";
import { ProposalCard } from "./ProposalCard";
import { proposals } from "../../global/testProps";


// FIXME:
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ProposalList({ orclient }: { orclient: ORClient }) {
  return (
    <Flex direction="column" gap={4}>
      {proposals.map((prop) => (
        <ProposalCard key={prop.id} proposal={prop} orclient={orclient} />
      ))}
    </Flex>
  );
}