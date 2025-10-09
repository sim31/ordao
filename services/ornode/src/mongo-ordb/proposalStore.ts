import { MongoClient, Db, ObjectId } from "mongodb";
import { PropId, TxHash, zTxHash } from "@ordao/ortypes";
import { IProposalStore, GetProposalsSpec, Proposal, zProposal } from "../ordb/iproposalStore.js";
import { withoutId } from "./utils.js";
import { withoutUndefined, stringify } from "@ordao/ts-utils";
import { StoreConfig, zStoreConfig } from "./storeConfig.js";
import { z } from "zod";

export const zProposalStoreConfig = z.object({
  defaultDocLimit: z.number().int().gt(0).default(10),
  maxDocLimit: z.number().int().gt(0).default(50)
})
export type ProposalStoreConfig = z.infer<typeof zProposalStoreConfig>;

export class ProposalStore implements IProposalStore {
  private readonly db: Db;
  private _cfg: ProposalStoreConfig;

  constructor(
    mongoClient: MongoClient,
    dbName: string,
    config: ProposalStoreConfig
  ) {
    this.db = mongoClient.db(dbName);
    this._cfg = config;
  }

  async getByOffchainId(id: PropId, createTxHash: TxHash): Promise<Proposal | null> {
    const doc = await this.proposals.findOne({ id, createTxHash });
    return doc ? zProposal.parse(withoutId(doc)) : null;
  }

  private get proposals() {
    return this.db.collection<Proposal>("proposals");
  }

  /**
   * Returns proposals ordered from oldest to newest
   */
  async getProposals(spec: GetProposalsSpec): Promise<Proposal[]> {
    const filter: any = {};

    if ('before' in spec && spec.before !== undefined) {
      filter['createTs'] = { $lt: spec.before }
    }

    if (spec.execStatusFilter !== undefined && spec.execStatusFilter.length > 0) {
      filter['status'] = { $in: spec.execStatusFilter }
    }

    if (spec.idFilter !== undefined && zTxHash.parse(spec.idFilter)) {
      filter['id'] = spec.idFilter;
    }

    const limit = spec.limit ? Math.min(spec.limit, this._cfg.maxDocLimit) : this._cfg.defaultDocLimit;

    const docs = 'skip' in spec && spec.skip !== undefined
      ? await this.proposals.find(filter).sort({ createTs: -1 }).skip(spec.skip).limit(limit)
      : await this.proposals.find(filter).sort({ createTs: -1 }).limit(limit);

    const dtos = docs.map(ent => {
      return zProposal.parse(withoutId(ent));
    });

    const rval = await dtos.toArray();
    console.debug("Found docs for spec. Spec: ", stringify(spec), ". Count: ", rval.length);
    return rval;
  }

  // removed: countBeforeByCreatePointer (deprecated)

  async createProposal(prop: Proposal): Promise<void> {
    const res = await this.proposals.insertOne(withoutUndefined(prop));
    console.debug("Inserted proposal _id: ", res.insertedId);
  }

  async updateProposal(id: PropId, update: Partial<Proposal>): Promise<void> {
    console.debug("Updating proposal id ", id, " with: ", update);

    const res = await this.proposals.updateOne(
      { id },
      { $set: update },
    );

    if (res.modifiedCount !== 1) {
      throw new Error(`Failed to update proposal: ${id}`);
    }
  }

  async deleteProp(id: PropId): Promise<void> {
    const res = await this.proposals.deleteOne({ id });
    if (res.deletedCount === 1) {
      console.debug("Deleted proposal id ", id);
    } else {
      console.debug("Failed to delete proposal id", id);
    }
  }

  // removed: getByIdAndOrdinal (deprecated)

  async getLatestById(id: PropId): Promise<Proposal | null> {
    const doc = await this.proposals.find({ id }).sort({ createTs: -1, _id: -1 }).limit(1).next();
    return doc ? zProposal.parse(withoutId(doc)) : null;
  }

  async getLatestUnexecutedById(id: PropId): Promise<Proposal | null> {
    const doc = await this.proposals
      .find({ id, status: "NotExecuted" })
      .sort({ createTs: -1, _id: -1 })
      .limit(1)
      .next();
    return doc ? zProposal.parse(withoutId(doc)) : null;
  }

  async getByIdAll(id: PropId): Promise<Proposal[]> {
    const cursor = this.proposals.find({ id }).sort({ createTs: 1, _id: 1 });
    const arr = await cursor.toArray();
    return arr.map(d => zProposal.parse(withoutId(d)));
  }

  async getByIdAndExecHash(id: PropId, execHash: TxHash): Promise<Proposal | null> {
    const doc = await this.proposals.findOne({ id, execHash });
    return doc ? zProposal.parse(withoutId(doc)) : null;
  }

  async updateLatestUnexecutedById(id: PropId, update: Partial<Proposal>): Promise<void> {
    const res = await this.proposals.updateOne(
      { id, status: "NotExecuted" },
      { $set: update },
      { sort: { createTs: -1, _id: -1 } as any }
    );
    if (res.matchedCount !== 1) {
      throw new Error(`Failed to find latest unexecuted proposal for id: ${id}`);
    }
    if (res.modifiedCount !== 1) {
      throw new Error(`Failed to update latest unexecuted proposal for id: ${id}`);
    }
  }

  async getEarliestById(id: PropId): Promise<Proposal | null> {
    const doc = await this.proposals.find({ id }).sort({ createTs: 1, _id: 1 }).limit(1).next();
    return doc ? zProposal.parse(withoutId(doc)) : null;
  }
}