import { Proposal } from "@ordao/orclient";

export function timeStr(ms: number): string {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
}

export function voteTimeLeftStrFromProp(proposal: Proposal): string {
  return timeStr(proposal.voteTimeLeftMs());
}

export function vetoTimeLeftStrFromProp(proposal: Proposal): string {
  return timeStr(proposal.vetoTimeLeftMs());
}

export function safeVoteTimeLeftStrFromProp(proposal: Proposal): string {
  try {
    return voteTimeLeftStrFromProp(proposal);
  } catch {
    return 'N/A';
  }
}

export function safeVetoTimeLeftStrFromProp(proposal: Proposal): string {
  try {
    return vetoTimeLeftStrFromProp(proposal);
  } catch {
    return 'N/A';
  }
}
