import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import OldRespectModule from "./OldRespect.js";

export default buildModule("Orec", (m) => {
  const oldRespect = m.useModule(OldRespectModule);
  const votePeriod = m.getParameter("votePeriod");
  const vetoPeriod = m.getParameter("vetoPeriod");
  const voteThreshold = m.getParameter("voteThreshold");
  const maxLiveYesVotes = m.getParameter("maxLiveYesVotes");

  const orec = m.contract("Orec", [
    oldRespect,
    votePeriod,
    vetoPeriod,
    voteThreshold,
    maxLiveYesVotes
  ]);

  return { orec };
});