import { ExecStatus, Stage, VoteStatus } from "@ordao/ortypes/orclient.js";

export const stageColors: Record<Stage, string> = {
  Voting: "yellow",
  Veto: "orange",
  Execution: "green",
  Expired: "black"
};

export const voteStatusColors: Record<VoteStatus, string> = {
  Passing: "yellow",
  Failing: "orange",
  Failed: "red",
  Passed: "green"
};

export const execStatusColors: Record<ExecStatus, string> = {
  NotExecuted: "gray",
  Executed: "black",
  ExecutionFailed: "red",
};