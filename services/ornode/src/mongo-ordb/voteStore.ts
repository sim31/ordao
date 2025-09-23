import { Db, Decimal128, MongoClient } from "mongodb";
import { IVoteStore, Vote, GetVotesSpec, zVote } from "../ordb/ivoteStore.js";
import { PropId } from "@ordao/ortypes";
import { stringify, withoutUndefined } from "@ordao/ts-utils";
import { withoutId } from "./utils.js";
import { StoreConfig, zStoreConfig } from "./storeConfig.js";
import { z } from "zod";

export const zVoteStoreConfig = zStoreConfig;
export type VoteStoreConfig = z.infer<typeof zVoteStoreConfig>;

const zStoredVote = zVote.extend({
  weight: z.instanceof(Decimal128)
});
type StoredVote = z.infer<typeof zStoredVote>;

const zStoredToVote = zStoredVote.transform(val => {
  const vote: Vote = {
    ...val,
    weight: val.weight.toString()
  }
  return vote;
}).pipe(zVote);

export class VoteStore implements IVoteStore {
  private readonly db: Db;
  private _cfg: VoteStoreConfig;

  constructor(
    mongoClient: MongoClient,
    dbName: string,
    config: VoteStoreConfig
  ) {
    this.db = mongoClient.db(dbName);
    this._cfg = config;
  }

  private get votes() {
    return this.db.collection<StoredVote>("votes");
  }

  async getVotes(spec: GetVotesSpec): Promise<Vote[]> {
    const filter: any = {};

    if (spec.before !== undefined) {
      filter['ts'] = { $lt: spec.before }
    }

    if (spec.propFilter !== undefined && spec.propFilter.length > 0) {
      filter['proposalId'] = { $in: spec.propFilter }
    }

    if (spec.voterFilter !== undefined && spec.voterFilter.length > 0) {
      filter['voter'] = { $in: spec.voterFilter };
    }

    if (spec.minWeight !== undefined) {
      const d = new Decimal128(spec.minWeight);
      filter['weight'] = { $gte: d };
    }

    if (spec.voteType !== undefined) {
      filter['vote'] = { $eq: spec.voteType }
    }

    const limit = spec.limit ? Math.min(spec.limit, this._cfg.maxDocLimit) : this._cfg.defaultDocLimit;

    const docs = await this.votes.find(filter)
      .sort({ ts: -1 })
      .limit(limit);
    const cursor = docs.map(ent => {
      return zStoredToVote.parse(withoutId(ent));
    });

    const rval = await cursor.toArray();
    console.debug("Found docs for getVotes spec. Spec: ", stringify(spec), ". Count: ", rval.length);
    return rval;
  }

  async createVote(vote: Vote): Promise<void> {
    const storedVote: StoredVote = {
      ...withoutUndefined(vote),
      weight: Decimal128.fromString(vote.weight)
    } 
    const res = await this.votes.insertOne(storedVote);
    console.debug("Inserted vote _id: ", res.insertedId);
  }

}