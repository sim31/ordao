import { ProposalCard } from "./ProposalCard";
import { Proposal } from "@ordao/orclient";


export interface ProposalListProps {
  proposals: Proposal[]
}

export function ProposalList({
  proposals,
}: ProposalListProps) {
  return (
    <>
      {proposals.map((prop) => (
        <ProposalCard key={prop.id} proposal={prop}/>
      ))}
    </>
  );
}
