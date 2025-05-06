import { Text, VStack } from "@chakra-ui/react";
import { ORClientType, Proposal } from "@ordao/orclient";
import { ProposalList } from "./ProposalList";


export interface PagedProposalListProps {
  proposals: Proposal[]
  orclient: ORClientType
  // forwardEnabled: boolean,
  // backEnabled: boolean
  // onForward: () => void
  // onBack: () => void
}

export function PagedProposalList({
  proposals,
  orclient
  // forwardEnabled,
  // backEnabled,
  // onForward,
  // onBack 
}: PagedProposalListProps) {
  return (
    <VStack>
      {/* <Flex
        mb="1em"
        alignItems="center"
        justifyContent="flex-end"
        w="100%"
      >
        <IconButton color="black" disabled={!backEnabled} onClick={onBack}>
          <IoIosArrowBack />
        </IconButton>
        <IconButton color="black" disabled={!forwardEnabled} onClick={onForward}>
          <IoIosArrowForward />
        </IconButton>
      </Flex> */}
      {
        proposals.length === 0
        ? <Text>No proposals found</Text>
        : <ProposalList orclient={orclient} proposals={proposals} />
      }
    </VStack>
  );
}