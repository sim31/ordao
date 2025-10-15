import { VStack } from "@chakra-ui/react";
import { Text } from "../Text";
import { Proposal } from "@ordao/orclient";
import { ProposalList } from "./ProposalList";
import { Loading } from "../Loading";
import { PageControls, PagedControlsProps } from "../PageControls";

export interface PagedProposalListProps extends PagedControlsProps {
  proposals: Proposal[]
  isLoading: boolean
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
    if (!isLoading && proposals.length > 2) {
      return <PageControls {...props} />
    }
  }

  return (
    <VStack mt="0.5em" mb="0.5em">
      {renderHeader()}
      {
        proposals.length === 0
        ? <Text mt="2em">No proposals found</Text>
        : <ProposalList proposals={proposals} />
      }
      {renderFooter()}
    </VStack>
  );
}