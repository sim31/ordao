import { MintRequest, packTokenId, zInitialMintType } from "@ordao/ortypes/respect1155.js";
import { RespectHolders } from "./respectHolders";
import { zBigNumberish, zBigNumberishToBigint } from "@ordao/ortypes";

export function buildMintRequests(holders: RespectHolders): MintRequest[] {
  const mintRequests: MintRequest[] = [];
  for (const holder of holders) {
    const id = packTokenId({
      owner: holder.address,
      mintType: zInitialMintType.value,
      periodNumber: 0
    })
    mintRequests.push({ 
      value: zBigNumberish.parse(holder.amount), 
      id: zBigNumberishToBigint.parse(id)
    });
  }
  return mintRequests;
}