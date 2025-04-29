import { Proposal } from "@ordao/ortypes/orclient.js";
import { VoteCountChart } from "./VotesCountChart";

export interface ProposalVoteStatProps {
  proposal: Proposal
}

export function ProposalVoteStat({ proposal }: ProposalVoteStatProps) {
  if (proposal.yesWeight === undefined || proposal.noWeight === undefined) {
    return null;
  } else {
    return <VoteCountChart yesWeight={Number(proposal.yesWeight)} noWeight={Number(proposal.noWeight)} />
  }
}