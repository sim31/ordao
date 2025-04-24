import { Badge, Button, Card, Flex, Text } from "@chakra-ui/react";
import { Proposal } from "@ordao/ortypes/orclient.js";
import { execStatusColors, stageColors, voteStatusColors } from "../../global/statusColors";
import { timeStr } from "../../utils/time.js";
import { propTitles } from "../../global/propTitles.js";
import { DecodedPropTable } from "./DecodedPropTable.js";
import { PropTable } from "./PropTable.js";
import { VoteCountChart } from "./VotesCountChart.js";

export interface ProposalCardProps {
  proposal: Proposal,
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  const shortenedId = proposal.id.slice(0, 6) + '...';

  const propKnown = proposal.cdata && proposal.addr && proposal.memo;
  const propTitle = propKnown 
    ? (proposal.decoded?.propType ? propTitles[proposal.decoded.propType] : 'Unknown proposal type')
    : 'Unknown proposal';
  const createTime = proposal.createTime.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
  })

  const renderProposalContent = () => {
    if (propKnown) {
      // TODO: do you need to check that this is a custom call?
      if (proposal.decoded) {
        return <DecodedPropTable dprop={proposal.decoded} />;
      } else {
        return <PropTable prop={proposal} /> 
      }
    } else {
      return <Text>Missing proposal data</Text>
    }
  }

  const renderVoteButton = () => {
    if (proposal.stage === 'Voting') {
      return (
        <Button variant="outline" onClick={() => console.log("Vote clicked")}>
          Vote
        </Button>
      );
    } else if (proposal.stage === 'Veto') {
      return (
        <Button variant="outline" onClick={() => console.log("Veto clicked")}>
          Veto
        </Button>
      );
    }
  }

  return (
    <Card.Root
      variant="outline"
      padding={4}
      margin="1em"
      gap={2}
      flexDirection="column"
    >

      <Flex gap={2} alignItems="center" mb={0.5}>
        <Badge 
          variant="solid" 
          colorPalette={stageColors[proposal.stage]} 
          size="lg"
        >
          {proposal.stage} {proposal.stage === 'Voting' || proposal.stage === 'Veto' ? `| ${timeStr(86300000)} left` : '' }
        </Badge>
        <Badge 
          variant="solid" 
          colorPalette={voteStatusColors[proposal.voteStatus]} 
          size="lg"
        >
          {proposal.voteStatus}
        </Badge>
        <Badge 
          variant={proposal.status === "NotExecuted" ? "outline" : "solid"} 
          colorPalette={execStatusColors[proposal.status]} 
          size="lg"
        >
          {proposal.status}
        </Badge>

        <Text fontSize="lg" color="gray.500">
          Created: {createTime}
        </Text>
        <Text fontSize="lg" color="gray.500">
          ID: {shortenedId}
        </Text>
      </Flex>

      <Flex gap={2} alignItems="center" mb={2}>
        <Text fontWeight="bold" fontSize="2xl">
          {propTitle}
        </Text>
      </Flex>


      {renderProposalContent()}

      {proposal.yesWeight !== undefined && proposal.noWeight !== undefined && (
        <VoteCountChart yesWeight={Number(proposal.yesWeight)} noWeight={Number(proposal.noWeight)} />
      )}

      <Flex gap={2} justifyContent="flex-start" mt="1em" mb="0.5em">
        {renderVoteButton()}
        <Button variant="outline" onClick={() => console.log("More info clicked")}>
          More Info
        </Button>
        <Button variant="outline" onClick={() => console.log("Copy Link clicked")}>
          Copy Link
        </Button>
      </Flex>
      

    </Card.Root>
  );
}