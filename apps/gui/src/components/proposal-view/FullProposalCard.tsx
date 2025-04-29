import { Box, Card, Text, Flex } from "@chakra-ui/react";
import { Proposal, propSchemaMap } from "@ordao/ortypes/orclient.js";
import { getTypeInfo } from "@ordao/zod-utils";
import { DecodedPropTable } from "./DecodedPropTable";
import { PropTable } from "./PropTable";
import { ShortPropId } from "./ShortPropId";
import { ProposalStatusLine } from "./ProposalStatusLine";

export interface FullProposalCardProps {
  proposal: Proposal,
}

export function FullProposalCard({ proposal }: FullProposalCardProps) {

  const propType = proposal.decoded?.propType;
  const zPropType = propType && propSchemaMap[propType];
  const typeInfo = zPropType && getTypeInfo(zPropType);
  // const desc = typeInfo?.description;
  const propTitle = typeInfo?.title !== undefined ? typeInfo.title : 'Unknown proposal type';
  const propKnown = proposal.cdata && proposal.addr && proposal.memo;

  // const propKnown = proposal.cdata && proposal.addr && proposal.memo;
  // const createTime = proposal.createTime.toLocaleString('en-US', {
  //   month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
  // })

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

  return (
    <Card.Root
      variant="outline"
      padding={4}
      gap={2}
      flexDirection="column"
    >
      {/* <Flex gap={2} alignItems="center" mb={2}>
        <Text fontWeight="bold" fontSize="2xl">
          {propTitle}
        </Text>
      </Flex> */}
      <Card.Header pt="0">
        <Flex gap={2} alignItems="center" mb={0.5}>
          <ShortPropId title="Proposal ID"id={proposal.id} />
        </Flex>
      </Card.Header>
      <Card.Body pt="0">
        <Card.Title fontSize="2xl">{propTitle}</Card.Title>
        <Card.Description fontSize="md" mt="1em" mb="1em" pb="1em" borderBottom="solid" borderColor="gray.200">
          {typeInfo?.description}
        </Card.Description>

        <Box mb="1em">
          <Text fontWeight="bold" fontSize="xl" mb="0.5em">Status</Text>
          <ProposalStatusLine proposal={proposal} />
        </Box>


        <Box mb="1em">
          <Text fontWeight="bold" fontSize="xl" mb="0.5em">Content</Text>
          {renderProposalContent()}
        </Box>

        <Box mb="1em">
          <Text fontWeight="bold" fontSize="xl" mb="0.5em">Details</Text>
        </Box>


      </Card.Body>

    </Card.Root>
  );
}