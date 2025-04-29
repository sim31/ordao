import { Badge, Button, Card, Flex, Text, Clipboard, IconButton } from "@chakra-ui/react";
import { Proposal, propSchemaMap } from "@ordao/ortypes/orclient.js";
import { execStatusColors, stageColors, voteStatusColors } from "../../global/statusColors.js";
import { timeStr } from "../../utils/time.js";
import { DecodedPropTable } from "./DecodedPropTable.js";
import { PropTable } from "./PropTable.js";
import { VoteCountChart } from "./VotesCountChart.js";
import { extractZodDescription } from "@ordao/zod-utils";

export interface ProposalCardProps {
  proposal: Proposal,
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  const shortenedId = proposal.id.slice(0, 6) + '...';

  const propType = proposal.decoded?.propType;
  const zPropType = propType && propSchemaMap[propType];
  const desc = zPropType && extractZodDescription(zPropType);
  const propTitle = desc?.title !== undefined ? desc.title : 'Unknown proposal type';

  const propKnown = proposal.cdata && proposal.addr && proposal.memo;
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
        <Clipboard.Root value={proposal.id} onStatusChange={() => console.log("copied")}>
          <Clipboard.Trigger asChild>
            <IconButton variant="surface" size="xs">
              <Clipboard.Indicator />
            </IconButton>
          </Clipboard.Trigger>
        </Clipboard.Root>
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

        <Clipboard.Root value="https://chakra-ui.com">
          <Clipboard.Trigger asChild>
            <Button variant="surface" size="sm">
              <Clipboard.Indicator />
              <Text>Copy Link</Text>
            </Button>
          </Clipboard.Trigger>
        </Clipboard.Root>
      </Flex>
      

    </Card.Root>
  );
}