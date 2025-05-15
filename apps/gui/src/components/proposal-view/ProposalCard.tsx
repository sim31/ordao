import { Card, Text, Clipboard, Flex } from "@chakra-ui/react";
import { Button } from "../Button.js";
import { Proposal, propSchemaMap, ValidVoteType } from "@ordao/ortypes/orclient.js";
import { DecodedPropTable } from "./DecodedPropTable.js";
import { PropTable } from "./PropTable.js";
import { extractZodDescription } from "@ordao/zod-utils";
import { ProposalStatusLine } from "./ProposalStatusLine.js";
import { VoteButtons } from "./VoteButtons.js";
import { ProposalVoteStat } from "./ProposalVoteStat.js";
import { Link } from "../Link.js";
import { ExecuteButton } from "../ExecuteButton.js";

export interface ProposalCardProps {
  proposal: Proposal,
  onExecuteClick: () => void;
  onVoteClick: (vote: ValidVoteType) => void;
}

export function ProposalCard({ proposal, onExecuteClick, onVoteClick }: ProposalCardProps) {
  const propType = proposal.decoded?.propType;
  const zPropType = propType && propSchemaMap[propType];
  const desc = zPropType && extractZodDescription(zPropType);
  const propTitle = desc?.title !== undefined ? desc.title : 'Unknown proposal type';
  // TODO: would be good not to depend on router here

  const propKnown = proposal.cdata && proposal.addr && proposal.memo;

  const renderProposalContent = () => {
    if (propKnown) {
      // TODO: do you need to check that this is a custom call?
      if (proposal.decoded) {
        return <DecodedPropTable dprop={proposal.decoded} shortenAddrs />;
      } else {
        return <PropTable prop={proposal} /> 
      }
    } else {
      return <Text>Missing proposal data</Text>
    }
  }

  return (
    <Card.Root
      variant="outline"
      padding={4}
      gap={2}
      flexDirection="column"
      maxWidth="4xl"
    >
      <Card.Header pt="0.5em" pl="1em">
        <ProposalStatusLine proposal={proposal}/>
      </Card.Header>

      <Card.Body pt="0" pl="1em" gap="1em">
        <Card.Title fontSize="2xl" asChild color="black">
          <Link to={`/proposals/$propId`} params={ { propId: proposal.id }}>
            {propTitle}
          </Link>
        </Card.Title>

        {renderProposalContent()}

        <ProposalVoteStat proposal={proposal} />
      </Card.Body>

      <Card.Footer mb="0" pb="0.5em" pl="1em" ml="0">
        <Flex wrap="wrap" gap={2}>
          <VoteButtons proposal={proposal} onVoteClick={onVoteClick}/>
          <ExecuteButton proposal={proposal} onClick={onExecuteClick} />
          <Button asChild>
            <Link to={`/proposals/$propId`} params={ { propId: proposal.id }}>
              Details
            </Link>  
          </Button>

          <Clipboard.Root value={`${window.location.origin}/proposals/${proposal.id}`}>
            <Clipboard.Trigger asChild>
              <Button size="sm">
                <Clipboard.Indicator />
                <Text>Copy Link</Text>
              </Button>
            </Clipboard.Trigger>
          </Clipboard.Root>

        </Flex>
      </Card.Footer>

    </Card.Root>
  );
}