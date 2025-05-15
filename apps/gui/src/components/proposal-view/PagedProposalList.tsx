import { Flex, Text, VStack } from "@chakra-ui/react";
import { IconButton } from "../IconButton";
import { Proposal } from "@ordao/orclient";
import { ProposalList } from "./ProposalList";
import { IoIosArrowBack, IoIosArrowForward, IoIosRefresh } from "react-icons/io";
import { Loading } from "../Loading";

export interface PagedProposalListProps {
  proposals: Proposal[]
  forwardEnabled: boolean,
  backEnabled: boolean
  onForward: () => void
  onBack: () => void
  onRefresh: () => void
  isLoading: boolean
}



export function PageControls(props: PagedProposalListProps) {
  const {
    forwardEnabled,
    backEnabled,
    onForward,
    onBack,
    onRefresh,
  } = props;

  return (
    <Flex
      alignItems="center"
      justifyContent="flex-end"
      w="100%"
    >
      <IconButton onClick={onRefresh}>
        <IoIosRefresh />
      </IconButton>

      <IconButton disabled={!backEnabled} onClick={onBack}>
        <IoIosArrowBack />
      </IconButton>
      <IconButton disabled={!forwardEnabled} onClick={onForward}>
        <IoIosArrowForward />
      </IconButton>
    </Flex>
  )

}

export function PagedProposalList(props: PagedProposalListProps) {
  const {
    proposals,
    isLoading
  } = props;

  const renderHeader = () => {
    if (isLoading) {
      return <Loading/>
    } else {
      return <PageControls {...props} />
    }
  }

  const renderFooter = () => {
    if (!isLoading) {
      return <PageControls {...props} />
    }
  }

  return (
    <VStack mt="0.5em" mb="0.5em">
      {renderHeader()}
      {
        proposals.length === 0
        ? <Text>No proposals found</Text>
        : <ProposalList proposals={proposals} />
      }
      {renderFooter()}
    </VStack>
  );
}