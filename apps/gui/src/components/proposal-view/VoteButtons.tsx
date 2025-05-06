import { Button, Flex } from "@chakra-ui/react";
import { isORClient, ORClientType } from "@ordao/orclient";
import { Proposal } from "@ordao/ortypes/orclient.js";

export interface VoteButtonsProps {
  proposal: Proposal;
  orclient: ORClientType
}

export function VoteButtons({ proposal, orclient } : VoteButtonsProps) {
  const renderYesButton = () => {
    if (isORClient(orclient)) {
      if (proposal.stage === 'Voting') {
        return (
          <Button
            variant="outline"
            backgroundColor="green.600"
            color="white"
            onClick={() => console.log("Vote Yes clicked")}
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
            onClick={() => console.log("Vote No clicked")}
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