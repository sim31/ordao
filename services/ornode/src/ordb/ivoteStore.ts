import { PropId } from "@ordao/ortypes";
import { GetVotesSpec as NGetVotesSpec, zVote as zNVote } from "@ordao/ortypes/ornode.js";
import { z } from "zod";

export * from "@ordao/ortypes/ornode.js";

export const zVote = zNVote;
export type Vote = z.infer<typeof zVote>;

export type GetVotesSpec = NGetVotesSpec;

export interface IVoteStore {
  /**
   * Returns votes ordered from oldest to newest
   */
  getVotes: (spec: GetVotesSpec) => Promise<Vote[]>;

  createVote: (vote: Vote) => Promise<void>;
}