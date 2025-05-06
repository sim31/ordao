import { Button, Flex } from "@chakra-ui/react";
import { isORClient, ORClientType } from "@ordao/orclient";
import { Proposal, ValidVoteType } from "@ordao/ortypes/orclient.js";

export interface VoteButtonsProps {
  proposal: Proposal;
  orclient: ORClientType
  onVoteClick: (vote: ValidVoteType) => void
}

export function VoteButtons({ proposal, orclient, onVoteClick } : VoteButtonsProps) {
  const renderYesButton = () => {
    if (isORClient(orclient)) {
      if (proposal.stage === 'Voting') {
        return (
          <Button
            variant="outline"
            backgroundColor="green.600"
            color="white"
            onClick={() => onVoteClick('Yes')}
          >
            Vote YES
          </Button>
        );
      }
    }
  }
  const renderNoButton = () => {
    if (isORClient(orclient)) {
      if (proposal.stage === 'Voting' || proposal.stage === 'Veto') {
        return (
          <Button
            variant="outline"
            backgroundColor="red.600"
            color="white"
            onClick={() => onVoteClick('No')}
          >
            Vote NO
          </Button>
        );
      }
    }
  }
  return (
    <Flex gap={2} justifyContent="flex-start">
      {renderYesButton()}
      {renderNoButton()}
    </Flex>
  );
}