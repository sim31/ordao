import { Box, Card, Text, Flex } from "@chakra-ui/react";
import { Proposal, propSchemaMap, ValidVoteType } from "@ordao/ortypes/orclient.js";
import { getTypeInfo } from "@ordao/zod-utils";
import { DecodedPropTable } from "./DecodedPropTable";
import { PropTable } from "./PropTable";
import { ShortPropId } from "./ShortPropId";
import { ProposalStatusLine } from "./ProposalStatusLine";
import { ProposalVoteStat } from "./ProposalVoteStat";
import { VoteButtons } from "./VoteButtons";
import { ObjectTable } from "./ObjectTable";
import { isORClient, OnchainActionRes, ORClientType } from "@ordao/orclient";
import { ExecuteButton } from "../ExecuteButton";
import { useState } from "react";
import { PropId } from "@ordao/ortypes";
import { useNavigate } from "@tanstack/react-router";
import OnchainActionModal from "../OnchainActionModal";

export interface FullProposalCardProps {
  proposal: Proposal,
  orclient: ORClientType,
}

interface ActionDetail {
  propId: PropId,
  action: Promise<OnchainActionRes>
  title: string
}

export function FullProposalCard({ proposal, orclient }: FullProposalCardProps) {

  const propType = proposal.decoded?.propType;
  const zPropType = propType && propSchemaMap[propType];
  const typeInfo = zPropType && getTypeInfo(zPropType);
  // const desc = typeInfo?.description;
  const propTitle = typeInfo?.title !== undefined ? typeInfo.title : 'Unknown proposal type';
  const propKnown = proposal.cdata && proposal.addr && proposal.memo;

  // TODO: duplicate with proposal list
  const [ actionPromise, setActionPromise ] = useState<ActionDetail | undefined>();
  const navigate = useNavigate();

  const onActionModalClose = async (success: boolean) => {
    if (success && actionPromise) {
      console.log("success");
      navigate({
        to: `/proposal/$propId`,
        params: { propId: actionPromise.propId }
      })
    }
    setActionPromise(undefined);
  }

  const onExecuteClick = () => {
    if (isORClient(orclient)) {
      setActionPromise({
        title: "Execute Proposal",
        propId: proposal.id,
        action: orclient.execute(proposal.id),
      });
    } else {
      throw new Error("ORClient cannot write");
    }
  }

  const onVoteClick = (vote: ValidVoteType) => {
    if (isORClient(orclient)) {
      setActionPromise({
        title: "Voting on proposal",
        propId: proposal.id,
        action: orclient.vote(proposal.id, vote),
      });
    } else {
      throw new Error("ORClient cannot write");
    }
  }

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

  const renderProposalDetails = () => {
    const obj = {
      ...proposal,
    }
    delete obj["decoded"];
    return <ObjectTable obj={obj} />
  }

  return (
    <>
      <OnchainActionModal
        title={actionPromise?.title ?? ""}
        action={actionPromise?.action}
        onClose={onActionModalClose}
      />
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

          <Box mb="2em">
            <Text fontWeight="bold" fontSize="xl" mb="0.5em">Status</Text>
            <ProposalStatusLine proposal={proposal} />
            <ProposalVoteStat proposal={proposal} />
            <ExecuteButton proposal={proposal} orclient={orclient} onClick={onExecuteClick}/>
            <VoteButtons proposal={proposal} orclient={orclient} onVoteClick={onVoteClick} />
          </Box>


          <Box mb="2em">
            <Text fontWeight="bold" fontSize="xl" mb="0.5em">Content</Text>
            {renderProposalContent()}
          </Box>

          <Box mb="2em">
            <Text fontWeight="bold" fontSize="xl" mb="0.5em">Details</Text>
            {renderProposalDetails()}
          </Box>


        </Card.Body>

      </Card.Root>
    </>
  );
}