import { useState } from "react";
import OnchainActionModal from "../OnchainActionModal";
import { ProposalCard } from "./ProposalCard";
import { isORClient, OnchainActionRes, ORClientType, Proposal } from "@ordao/orclient";
import { PropId } from "@ordao/ortypes";
import { useNavigate } from "@tanstack/react-router";

export interface ProposalListProps {
  proposals: Proposal[],
  orclient: ORClientType
}

interface ActionDetail {
  propId: PropId,
  action: Promise<OnchainActionRes>
  title: string
}

export function ProposalList({
  proposals,
  orclient
}: ProposalListProps) {
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
          orclient={orclient}
        />
      ))}
    </>
  );
}
