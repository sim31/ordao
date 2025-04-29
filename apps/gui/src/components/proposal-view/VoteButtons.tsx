import { Button, Flex } from "@chakra-ui/react";
import { Proposal } from "@ordao/ortypes/orclient.js";

export interface VoteButtonsProps {
  proposal: Proposal;
}

export function VoteButtons({ proposal } : VoteButtonsProps) {
  const renderYesButton = () => {
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
  const renderNoButton = () => {
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
  return (
    <Flex gap={2} justifyContent="flex-start">
      {renderYesButton()}
      {renderNoButton()}
    </Flex>
  );
}