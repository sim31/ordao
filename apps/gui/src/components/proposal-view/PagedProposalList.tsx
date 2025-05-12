import { Center, Flex, IconButton, Spinner, Text, VStack } from "@chakra-ui/react";
import { Proposal } from "@ordao/orclient";
import { ProposalList } from "./ProposalList";
import { IoIosArrowBack, IoIosArrowForward, IoIosRefresh } from "react-icons/io";


export interface PagedProposalListProps {
  proposals: Proposal[]
  forwardEnabled: boolean,
  backEnabled: boolean
  onForward: () => void
  onBack: () => void
  onRefresh: () => void
  isLoading: boolean
}

export function PagedProposalList({
  proposals,
  forwardEnabled,
  backEnabled,
  onForward,
  onBack,
  onRefresh,
  isLoading
}: PagedProposalListProps) {
  const renderHeader = () => {
    if (isLoading) {
      return <Center><Spinner /></Center>
    } else {
      return (
        <Flex
          mb="1em"
          alignItems="center"
          justifyContent="flex-end"
          w="100%"
        >
          <IconButton color="black" onClick={onRefresh}>
            <IoIosRefresh />
          </IconButton>

          <IconButton color="black" disabled={!backEnabled} onClick={onBack}>
            <IoIosArrowBack />
          </IconButton>
          <IconButton color="black" disabled={!forwardEnabled} onClick={onForward}>
            <IoIosArrowForward />
          </IconButton>
        </Flex>
      )
    }

  }
  return (
    <VStack>
      {renderHeader()}
      {
        proposals.length === 0
        ? <Text>No proposals found</Text>
        : <ProposalList proposals={proposals} />
      }
    </VStack>
  );
}