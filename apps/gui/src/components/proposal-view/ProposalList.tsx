import { useState } from "react";
import OnchainActionModal from "../OnchainActionModal";
import { ProposalCard } from "./ProposalCard";
import { isORClient, OnchainActionRes, Proposal, ValidVoteType } from "@ordao/orclient";
import { PropId } from "@ordao/ortypes";
import { useNavigate } from "@tanstack/react-router";
import { useAssertOrclient } from "@ordao/privy-react-orclient/backup-provider/useOrclient.js";

export interface ProposalListProps {
  proposals: Proposal[],
}

interface ActionDetail {
  propId: PropId,
  action: Promise<OnchainActionRes>
  title: string
}

export function ProposalList({
  proposals,
}: ProposalListProps) {
  const [ actionPromise, setActionPromise ] = useState<ActionDetail | undefined>();
  const navigate = useNavigate();

  const orclient = useAssertOrclient();

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

  const onExecuteClick = (propId: PropId) => {
    if (isORClient(orclient)) {
      setActionPromise({
        title: "Execute Proposal",
        propId,
        action: orclient.execute(propId),
      });
    } else {
      throw new Error("ORClient cannot write");
    }
  }

  const onVoteClick = (propId: PropId, vote: ValidVoteType) => {
    if (isORClient(orclient)) {
      setActionPromise({
        title: "Voting on proposal",
        propId,
        action: orclient.vote(propId, vote),
      });
    } else {
      throw new Error("ORClient cannot write");
    }
  }

  return (
    <>
      <OnchainActionModal
        title={actionPromise?.title ?? ""}
        action={actionPromise?.action}
        onClose={onActionModalClose}
      />

      {proposals.map((prop) => (
        <ProposalCard
          key={prop.id}
          proposal={prop}
          onExecuteClick={() => onExecuteClick(prop.id)}
          onVoteClick={(vote) => onVoteClick(prop.id, vote)}
        />
      ))}
    </>
  );
}
