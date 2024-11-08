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
}