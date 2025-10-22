import { Orec, Orec__factory } from "@ordao/orec/typechain-types";
import { ExecutedEvent } from "@ordao/orec/typechain-types/contracts/Orec.js";
import { z } from "zod";
import { Bytes, zBigNumberish, zBytes, zBytes32, zBytesLike, zEthAddress, zTxHash, zUint, zUint8 } from "./eth.js";
import { preprocessResultOrObj } from "./utils.js";
import { hexlify, toUtf8Bytes, toUtf8String } from "ethers";
import Big from "big.js";

export type OrecContract = Orec;
export { Orec__factory };
export const OrecFactory = Orec__factory;
export type MessageStruct = Orec.MessageStruct;
export type VoteStruct = Orec.VoteStruct;
export type VoteStructOut = Orec.VoteStructOutput;

export {
  ProposalCreatedEvent,
  ExecutedEvent,
  ExecutionFailedEvent,
  EmptyVoteInEvent,
  WeightedVoteInEvent,
  SignalEvent,
  ProposalCanceledEvent
} from "@ordao/orec/typechain-types/contracts/Orec.js";
export * from "@ordao/orec/typechain-types/common.js";

export enum Stage {
  Voting,
  Veto,
  Execution,
  Expired
}
export const zStage = z.preprocess(
  val => zUint8.parse(val),
  z.nativeEnum(Stage)
);

export enum VoteStatus {
  Passing,
  Failing,
  Passed,
  Failed
}
export const zVoteStatus = z.preprocess(
  val => zUint8.parse(val),
  z.nativeEnum(VoteStatus)
);

export enum ExecStatus {
  NotExecuted = 0,
  Executed = 1,
  ExecutionFailed,
  Canceled
}
const zExecStatusEnum = z.nativeEnum(ExecStatus);
export const zExecStatus = z.preprocess(val => zUint8.parse(val), zExecStatusEnum);

export const zExecStatusStr = z.enum(["NotExecuted", "Executed", "ExecutionFailed", "Canceled"]);
export type ExecStatusStr = z.infer<typeof zExecStatusStr>;

export const execStatusMap: Record<ExecStatus, ExecStatusStr> = {
  [ExecStatus.Executed]: "Executed",
  [ExecStatus.ExecutionFailed]: "ExecutionFailed",
  [ExecStatus.NotExecuted]: "NotExecuted",
  [ExecStatus.Canceled]: "Canceled"
}

export const zExecStatusToStr = zExecStatus.transform((s) => {
  return execStatusMap[s];
}).pipe(zExecStatusStr);


export const zPropId = zBytes32;
export type PropId = z.infer<typeof zPropId>;

export const zOffchainPropId = z.object({
  id: zPropId,
  createTxHash: zTxHash
});
export type OffchainPropId = z.infer<typeof zOffchainPropId>;

export enum VoteType {
  None = 0,
  Yes = 1,
  No = 2
}
export const zVoteType = z.preprocess(
  val => zUint8.parse(val),
  z.nativeEnum(VoteType)
)

export const zVoteTypeStr = z.enum(["None", "Yes", "No"]);
export type VoteTypeStr = z.infer<typeof zVoteTypeStr>;

export const zValidVoteTypeStr = z.enum(["Yes", "No"]);

export const voteTypeMap: Record<VoteType, VoteTypeStr> = {
  [VoteType.Yes]: "Yes",
  [VoteType.No]: "No",
  [VoteType.None]: "None"
}

export const zVoteTypeToStr = zVoteType.transform((vt) => {
  return voteTypeMap[vt];
}).pipe(zVoteTypeStr);

export const strToVtMap: Record<VoteTypeStr, VoteType> = {
  Yes: VoteType.Yes,
  No: VoteType.No,
  None: VoteType.None
}

export const zStrToVoteType = zVoteTypeStr.transform((vt) => {
  return strToVtMap[vt];
}).pipe(zVoteType);

export enum KnownSignalTypes { 
  Tick = 0,
};
export const zKnownSignalTypes = z.preprocess(
  val => zUint8.parse(val),
  z.nativeEnum(KnownSignalTypes)
);

const signalTypeDesc = `
Signal Type

Number 0-255 identifying signal type.

Reserved:
0 - Tick
`
export const zSignalType = zUint8;
export const zCustomSignalType = zSignalType.gt(0).describe(signalTypeDesc);
export const zTickSignalType = z.literal(Number(zKnownSignalTypes.innerType().enum.Tick));

export const zBytesToVoteMemo = zBytes.transform(val => {
  return decodeVoteMemo(val);
  
}).pipe(z.string());

export const zMemoToBytes = z.string().transform(val => {
  return encodeVoteMemo(val);
}).pipe(zBytes);

export function encodeVoteMemo(memo?: string): Bytes {
  return memo !== undefined && memo != ""
    ? hexlify(toUtf8Bytes(memo)) as `0x${string}`
    : "0x";
}

export function decodeVoteMemo(memoBytes: Bytes): string {
  const str = toUtf8String(memoBytes);
  return str;
}

export type CCustomSignalArgs = Parameters<Orec['signal']>;

export type CSetPeriodsArgs = Parameters<Orec['setPeriodLengths']>;

export type CSetMinWeightArgs = Parameters<Orec['setMinWeight']>;

export type CMessage = Orec.MessageStruct;
export type CProposalState = Omit<
  Awaited<ReturnType<Orec["proposals"]>>,
  keyof [bigint, bigint, bigint, bigint]
>

export const zVoteWeight = z.coerce.bigint().gte(0n);
export type VoteWeight = z.infer<typeof zVoteWeight>;

export function voteWeightToStr(weight: VoteWeight, decimals?: number): string {
  if (decimals !== undefined && decimals !== 0) {
    Big.RM = Big.roundDown;
    Big.DP = decimals ?? 0;
    const wb = Big(weight.toString()).div(10 ** decimals)
    return wb.toFixed();
  } else {
    return weight.toString();
  }
}

export function strToVoteWeight(str: string, decimals?: number): VoteWeight {
  if (decimals !== undefined && decimals !== 0) {
    Big.RM = Big.roundDown;
    Big.DP = decimals;
    return BigInt(Big(str).times(10 ** decimals).toFixed())
  } else {
    return BigInt(str);
  }
}

export type CVote = Omit<
  Awaited<ReturnType<Orec["getLiveVote"]>>,
  keyof [bigint, bigint]
>
export const zVoteBase = z.object({
  vtype: zVoteType,
  weight: zVoteWeight
})

export const zVote = preprocessResultOrObj(zVoteBase);
export type Vote = z.infer<typeof zVote>;
const voteVerify = zVote.refine((val) => {
  const cvote: CVote = {
    vtype: BigInt(val.vtype),
    weight: val.weight
  };
  return true;
})

export const zSignalArgsBase = z.object({
  signalType: zUint8, 
  data: zBytesLike
});
export const zSignalArgs = preprocessResultOrObj(zSignalArgsBase);
const customSignalVerify = zSignalArgs.refine((val) => {
  const args: CCustomSignalArgs = [
    val.signalType,
    val.data
  ];
  return true;
});
export type CustomSignalArgs = z.infer<typeof zSignalArgs>;

export const zSetPeriodsArgsBase = z.object({
  newVoteLen: zUint,
  newVetoLen: zUint,
});
export const zSetPeriodsArgs = preprocessResultOrObj(zSetPeriodsArgsBase);
export type SetPeriodsArgs = z.infer<typeof zSetPeriodsArgs>;
const setPeriodsVerify = zSetPeriodsArgs.refine((val) => {
  const args: CSetPeriodsArgs = [
    val.newVoteLen,
    val.newVetoLen
  ];
  return true;
})

export const zSetMinWeightArgsBase = z.object({
  newMinWeight: zUint,
});
export const zSetMinWeightArgs = preprocessResultOrObj(zSetMinWeightArgsBase);
export type SetMinWeightArgs = z.infer<typeof zSetMinWeightArgs>;
const setMinWeightVerify = zSetMinWeightArgs.refine((val) => {
  const args: CSetMinWeightArgs = [
    val.newMinWeight
  ];
  return true;
})

export const zPropStateBase = z.object({
  createTime: z.bigint().gt(0n),
  yesWeight: z.bigint(),
  noWeight: z.bigint(),
});
export const zProposalState = preprocessResultOrObj(zPropStateBase);
export type ProposalState = z.infer<typeof zProposalState>;

const zPropStateVerify = zProposalState.refine(val => {
  const cprop: CProposalState = {
    createTime: val.createTime,
    yesWeight: val.yesWeight,
    noWeight: val.noWeight,
  };
  return true;
}, "Zod type does not match type from contract interface")


export const zProposedMsgBase = z.object({
  addr: zEthAddress,
  cdata: zBytesLike,
  memo: zBytesLike
});
export const zProposedMsg = preprocessResultOrObj(zProposedMsgBase);
const zProposedMsgVerify = zProposedMsg.refine(val => {
  const msg: CMessage = val;
  return true;
});
export type ProposedMsg = z.infer<typeof zProposedMsg>;

export const zOnchainProp = zPropStateBase.extend({
  id: zPropId,
  stage: zStage,
  voteStatus: zVoteStatus,
  createTime: z.date()
});
export type OnchainProp = z.infer<typeof zOnchainProp>;

export const zPeriodLength = zUint;

export {
  MIN_1, HOUR_1, DAY_1, DAY_6, WEEK_1,
  propId
} from "@ordao/orec/utils";

