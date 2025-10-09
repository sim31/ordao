import { PropId, TxHash } from "@ordao/ortypes";
import { GetProposalsSpec, zStoredProposal } from "@ordao/ortypes/ornode.js";
import { z } from "zod";

export * from "@ordao/ortypes/ornode.js";

export const zProposal = zStoredProposal;
export type Proposal = z.infer<typeof zProposal>;

export interface IProposalStore {
  /**
   * Returns proposals ordered from oldest to newest
   */
  getProposals: (spec: GetProposalsSpec) => Promise<Proposal[]>;

  createProposal: (prop: Proposal) => Promise<void>;

  updateProposal: (id: PropId, prop: Partial<Proposal>) => Promise<void>;

  deleteProp: (id: PropId) => Promise<void>;

  /**
   * New APIs for handling non-unique on-chain PropIds off-chain
   */
  /** Retrieve a specific offchain proposal instance by (PropId, createTxHash) */
  getByOffchainId: (id: PropId, createTxHash: TxHash) => Promise<Proposal | null>;

  /** Earliest-created instance for this id (stable legacy target) */
  getEarliestById: (id: PropId) => Promise<Proposal | null>;

  /** Latest NotExecuted by creation order (blockNumber/logIndex desc) */
  getLatestUnexecutedById: (id: PropId) => Promise<Proposal | null>;

  /** Update only the latest NotExecuted instance for this id */
  updateLatestUnexecutedById: (id: PropId, prop: Partial<Proposal>) => Promise<void>;

  getLatestById: (id: PropId) => Promise<Proposal | null>;

  getByIdAndExecHash: (id: PropId, execHash: TxHash) => Promise<Proposal | null>;
}