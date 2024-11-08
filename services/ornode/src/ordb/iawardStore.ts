import { EthAddress } from "@ordao/ortypes";
import { GetAwardsSpec } from "@ordao/ortypes/ornode.js";
import { TokenId, BurnData, zRespectAwardMt as zNRespectAwardMt } from "@ordao/ortypes/respect1155.js"
import { z } from "zod";

export * from "@ordao/ortypes/respect1155.js";

export const zRespectAwardMt = zNRespectAwardMt;
export type RespectAwardMt = z.infer<typeof zRespectAwardMt>;

export interface IAwardStore {
  getAward: (id: TokenId) => Promise<RespectAwardMt | null>

  getAwards(spec?: GetAwardsSpec): Promise<RespectAwardMt[]>;

  createAwards: (awards: RespectAwardMt[]) => Promise<void>

  deleteAwards: (tokenIds: TokenId[]) => Promise<void>

  burnAwards: (tokenIds: TokenId[], burnData: BurnData) => Promise<void>
}