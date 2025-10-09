import { PropId, TxHash } from "@ordao/ortypes";
import { GetProposalsSpec, zStoredProposal } from "@ordao/ortypes/ornode.js";
import { z } from "zod";

export * from "@ordao/ortypes/ornode.js";

export const zProposal = zStoredProposal;
export type Proposal = z.infer<typeof zProposal>;

export interface IProposalStore {
  getProposal: (id: PropId) => Promise<Proposal | null>;

  /**
   * Returns proposals ordered from oldest to newest
   */
  getProposals: (spec: GetProposalsSpec) => Promise<Proposal[]>;

  createProposal: (prop: Proposal) => Promise<void>;

  updateProposal: (id: PropId, prop: Partial<Proposal>) => Promise<void>;

  deleteProp: (id: PropId) => Promise<void>;

  /**
   * New APIs for handling non-unique proposal ids
   */
  getByIdAndOrdinal: (id: PropId, ordinal: number) => Promise<Proposal | null>;

  /** Latest by instanceOrdinal (desc) regardless of status */
  getLatestById: (id: PropId) => Promise<Proposal | null>;

  /** Latest NotExecuted by instanceOrdinal (desc) */
  getLatestUnexecutedById: (id: PropId) => Promise<Proposal | null>;

  /** Full history ordered from oldest (ordinal 1) to newest */
  getByIdAll: (id: PropId) => Promise<Proposal[]>;

  /** Update only the latest NotExecuted instance for this id */
  updateLatestUnexecutedById: (id: PropId, prop: Partial<Proposal>) => Promise<void>;
}