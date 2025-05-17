import { Box, Card, Flex } from "@chakra-ui/react";
import { Text } from "../Text";
import { isORClient, OnchainActionRes } from "@ordao/orclient";
import { PropId } from "@ordao/ortypes";
import { Proposal, propSchemaMap, ValidVoteType } from "@ordao/ortypes/orclient.js";
import { useAssertOrclient } from "@ordao/privy-react-orclient/backup-provider/useOrclient.js";
import { getTypeInfo } from "@ordao/zod-utils";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ExecuteButton } from "../ExecuteButton";
import OnchainActionModal from "../OnchainActionModal";
import { DecodedPropTable } from "./DecodedPropTable";
import { ObjectTable } from "./ObjectTable";
import { ProposalStatusLine } from "./ProposalStatusLine";
import { ProposalVoteStat } from "./ProposalVoteStat";
import { PropTable } from "./PropTable";
import { ShortPropId } from "./ShortPropId";
import { VoteButtons } from "./VoteButtons";

export interface FullProposalCardProps {
  proposal: Proposal,
}

interface ActionDetail {
  propId: PropId,
  action: Promise<OnchainActionRes>
  title: string
}

export function FullProposalCard({ proposal }: FullProposalCardProps) {
  const orclient = useAssertOrclient();

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
        to: `/proposals/$propId`,
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
            <ExecuteButton proposal={proposal} onClick={onExecuteClick}/>
            <VoteButtons proposal={proposal} onVoteClick={onVoteClick} />
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