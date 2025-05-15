import { Proposal } from "@ordao/orclient";

export function timeStr(ms: number): string {
  const absMs = Math.abs(ms);

  const days = Math.floor(absMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));

  const sign = ms < 0 && (hours || days || minutes) ? '-' : '';
  if (days > 0) {
    return `${sign}${days}d ${hours}h`;
  } else {
    return `${sign}${hours}h ${minutes}m`;
  }
}

export function voteTimeLeftStrFromProp(proposal: Proposal): string {
  // Should show negative number in case something is wrong
  return timeStr(proposal.voteTimeLeftMs());
}

// Test
// console.log("timeStr(4000): ", timeStr(4000));
// // Should show zero
// console.log("timeStr(-4000): ", timeStr(-4000));
// // Should show negative number (1 min)
// console.log("timeStr(-61000): ", timeStr(-61000));
// // Should show negative number (1 min)
// console.log("timeStr(-60* 61000): ", timeStr(-60 * 61000));

export function vetoTimeLeftStrFromProp(proposal: Proposal): string {
  return timeStr(proposal.vetoTimeLeftMs());
}

export function safeVoteTimeLeftStrFromProp(proposal: Proposal): string {
  try {
    return voteTimeLeftStrFromProp(proposal);
  } catch (err) {
    console.log("Error in safeVoteTimeLeftStrFromProp: ", err);
    return 'N/A';
  }
}

export function safeVetoTimeLeftStrFromProp(proposal: Proposal): string {
  try {
    return vetoTimeLeftStrFromProp(proposal);
  } catch (err) {
    console.log("Error in safeVetoTimeLeftStrFromProp: ", err);
    return 'N/A';
  }
}
