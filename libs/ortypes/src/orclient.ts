import { ZodType, z } from "zod";
import { PropType, zBreakoutType, zGroupNum, zPropType, zRankings } from "./fractal.js";
import { zCustomSignalType, zOnchainProp as zNOnchainProp, zPeriodLength, zPropId, zProposedMsgBase } from "./orec.js";
import { zMeetingNum, zMintType, zTokenId, zTokenIdNum } from "./respect1155.js";
import { zBytes, zEthAddress, zTxHash, zUint } from "./eth.js";
import { zTimestamp } from "./common.js";
import { ErrorType } from "@ordao/ethers-decode-error";

const mtDesc = `
Proposal Description

Information for voters
` 

const mtTitle = `
Title


`

const mtDescription = `
Description

`
export const zProposalMetadata = z.object({
  propTitle: z.string().max(64).optional().describe(mtTitle),
  propDescription: z.string().optional().describe(mtDescription)
}).describe(mtDesc);
export type ProposalMetadata = z.infer<typeof zProposalMetadata>;

export const zDecodedPropBase = z.object({
  propType: zPropType,
  metadata: zProposalMetadata
})
export type DecodedPropBase = z.infer<typeof zDecodedPropBase>;

export const zVoteType = z.enum(["None", "Yes", "No"])
export type VoteType = z.infer<typeof zVoteType>;

export const zValidVoteType = z.enum(["Yes", "No"]);
export type ValidVoteType = z.infer<typeof zValidVoteType>;

export const zStage = z.enum(["Voting", "Veto", "Execution", "Expired"]);
export type Stage = z.infer<typeof zStage>;

export const zVoteStatus = z.enum(["Passing", "Failing", "Passed", "Failed"]);
export type VoteStatus = z.infer<typeof zVoteStatus>;

export const zExecStatus = z.enum(["NotExecuted", "Executed", "ExecutionFailed", "Canceled"]);
export type ExecStatus = z.infer<typeof zExecStatus>;

export const zVoteWeight = z.string()
export type VoteWeight = z.infer<typeof zVoteWeight>;

export const zVoteRequest = z.object({
  propId: zPropId,
  vote: zVoteType,
  memo: z.string().optional()
});
export type VoteRequest = z.infer<typeof zVoteRequest>;

export const zVote = z.object({
  proposalId: zPropId,
  voter: zEthAddress,
  vote: zVoteType,
  weight: zVoteWeight,
  memo: z.string().optional(),
  date: z.date().optional(),
  txHash: zTxHash.optional(),
})
export type Vote = z.infer<typeof zVote>;

export const zVoteWithProp = zVoteRequest
  .omit({ propId: true })
  .extend({ vote: zVoteType.default("Yes") })
export type VoteWithProp = z.infer<typeof zVoteWithProp>;

export const zVoteWithPropRequest = zVoteWithProp.partial({ vote: true });
export type VoteWithPropRequest = z.infer<typeof zVoteWithPropRequest>;

const respectBreakoutDesc = `
Respect Breakout

Mint Respect to a breakout group from Respect game.
`

export const zBreakoutResult = z.object({
  rankings: zRankings,
  groupNum: zGroupNum
});
export type BreakoutResult = z.infer<typeof zBreakoutResult>;


export const zRespectBreakoutRequest = zBreakoutResult.extend({
  meetingNum: zMeetingNum.optional(),
  metadata: zProposalMetadata.optional()
}).describe(respectBreakoutDesc);
export type RespectBreakoutRequest = z.infer<typeof zRespectBreakoutRequest>;

export const zRespectBreakout = zDecodedPropBase.merge(zBreakoutResult).extend({
  propType: z.literal(zPropType.Enum.respectBreakout),
  meetingNum: zMeetingNum,
  mintData: zBytes
}).describe(respectBreakoutDesc);
export type RespectBreakout = z.infer<typeof zRespectBreakout>;

const respectBreakoutX2Desc = `
Respect Breakout x2

Mint Respect to a breakout group from Respect game, using doubled values for each level.
`

export const zRespectBreakoutX2Request = zBreakoutResult.extend({
  meetingNum: zMeetingNum.optional(),
  metadata: zProposalMetadata.optional()
}).describe(respectBreakoutX2Desc);
export type RespectBreakoutX2Request = z.infer<typeof zRespectBreakoutX2Request>;

export const zRespectBreakoutX2 = zDecodedPropBase.merge(zBreakoutResult).extend({
  propType: z.literal(zPropType.Enum.respectBreakoutX2),
  meetingNum: zMeetingNum,
  mintData: zBytes
}).describe(respectBreakoutX2Desc);
export type RespectBreakoutX2 = z.infer<typeof zRespectBreakoutX2>;

export const respectBreakoutReqSchemas = {
  [zBreakoutType.Values.respectBreakout]: zRespectBreakoutRequest,
  [zBreakoutType.Values.respectBreakoutX2]: zRespectBreakoutX2Request
} as const;

const accountDesc = `
Account (recipient)

Address of an account that will receive Respect.
`
const valueDesc = `
Value

Value (also known as denomination) of the Respect award to be minted. This determines the amount by which total Respect score will be increased.
`
const titleDesc = `
Title

Title of the Respect Award
`
const reasonDesc = `
Reason

More descriptive reason for the Respect Award
`

const respectAccountDescription = `
Respect Account

Mint Respect to an account.
`

export const zRespectAccountFields = z.object({
  account: zEthAddress.describe(accountDesc),
  value: zUint.describe(valueDesc),
  title: z.string().max(64).describe(titleDesc),
  reason: z.string().describe(reasonDesc),
  meetingNum: zMeetingNum,
  mintType: zMintType,
  groupNum: zGroupNum.optional(),
  tokenId: zTokenId
});


export const zRespectAccount = zDecodedPropBase.merge(zRespectAccountFields).extend({
  propType: z.literal(zPropType.Enum.respectAccount),
}).describe(respectAccountDescription);
export type RespectAccount = z.infer<typeof zRespectAccount>;

export const zRespectAccountRequest = zRespectAccount
  .describe(respectAccountDescription)
  .omit({ propType: true, tokenId: true })
  .partial({ mintType: true, meetingNum: true, metadata: true })
export type RespectAccountRequest = z.infer<typeof zRespectAccountRequest>;


const respectAccountBatchDescription = `
Respect Account Batch

Mint multiple respect awards at once
`
const awardsDesc = `
Awards

List of awards to mint
`

export const zRespectAccountBatch = zDecodedPropBase.extend({
  propType: z.literal(zPropType.Enum.respectAccountBatch),
  awards: z.array(zRespectAccountFields).min(1).describe(awardsDesc)
}).describe(respectAccountBatchDescription);
export type RespectAccountBatch = z.infer<typeof zRespectAccountBatch>;

export const zRespectAccountReqFields = zRespectAccountFields
  .omit({ tokenId: true })
  .partial({ mintType: true, meetingNum: true })

export const zRespectAccountBatchRequest = zRespectAccountBatch
  .extend({ awards: z.array(zRespectAccountReqFields).min(1).describe(awardsDesc) })
  .describe(respectAccountBatchDescription)
  .omit({ propType: true })
  .partial({ metadata: true })
export type RespectAccountBatchRequest = z.infer<typeof zRespectAccountBatchRequest>;

const reason = `
Reason for burning

Information for historical record.
`
const burnRespectDescription = `
Burn Respect

Burn 1 Respect award. This will also subract value of the award from the total Respect score.
`
export const zBurnRespect = zDecodedPropBase.extend({
  propType: z.literal(zPropType.Enum.burnRespect),
  tokenId: zTokenId,
  reason: z.string().describe(reason)
}).describe(burnRespectDescription);
export type BurnRespect = z.infer<typeof zBurnRespect>;

export const zBurnRespectRequest = zBurnRespect
  .omit({ propType: true })
  .partial({ metadata: true })
  .describe(burnRespectDescription);
export type BurnRespectRequest = z.infer<typeof zBurnRespectRequest>;

const burnRespectBatchDescription = `
Burn Respect Batch

Burn multiple Respect awards at once.
`
const tokenIdsDesc = `
Tokens


`
export const zBurnRespectBatch = zDecodedPropBase.extend({
  propType: z.literal(zPropType.Enum.burnRespectBatch),
  tokenIds: z.array(zTokenId).min(1).describe(tokenIdsDesc),
  reason: z.string().describe(reason)
}).describe(burnRespectBatchDescription);
export type BurnRespectBatch = z.infer<typeof zBurnRespectBatch>;

export const zBurnRespectBatchRequest = zBurnRespectBatch
  .omit({ propType: true })
  .partial({ metadata: true })
  .describe(burnRespectBatchDescription);
export type BurnRespectBatchRequest = z.infer<typeof zBurnRespectBatchRequest>;

const signalBytesDesc = `
Data

Data to send with the signal. Use '0x' for empty data.
`
const linkDesc = `
Link

Optional link to signal with the signal.
`

const customSignalDescription = `
Custom Signal

Emit a signal event from OREC contract
`

export const zCustomSignal = zDecodedPropBase.extend({
  propType: z.literal(zPropType.Enum.customSignal),
  signalType: zCustomSignalType,
  data: zBytes.describe(signalBytesDesc),
  link: z.string().optional().describe(linkDesc)
}).describe(customSignalDescription);
export type CustomSignal = z.infer<typeof zCustomSignal>;

export const zCustomSignalRequest = zCustomSignal
  .describe(customSignalDescription)
  .omit({ propType: true })
  .partial({ metadata: true });
export type CustomSignalRequest = z.infer<typeof zCustomSignalRequest>;

const tickDescription = `
Tick

Increment period number (and meeting number) by 1.
`
const tickBytesDesc = `
Data

Optional data to send with the tick. If not specified, it will be filled with next meeting number.
`;
const tickLinkDesc = `
Link

Optional link to signal with the signal.
`

export const zTick = zDecodedPropBase.extend({
  propType: z.literal(zPropType.Enum.tick),
  link: z.string().optional().describe(tickLinkDesc),
  data: zBytes.optional().describe(tickBytesDesc)
}).describe(tickDescription)
export type Tick = z.infer<typeof zTick>;


export const zTickRequest = zTick
  .describe(tickDescription)
  .omit({ propType: true })
  .partial({ metadata: true, data: true });
export type TickRequest = z.infer<typeof zTickRequest>;

const cdataDescription = `
Calldata

Data that will be sent to the contract
`
const addressDescription = `
Address

Address of the contract
`
const customCallDescription = `
Custom Call

Send any message to any smart contract
`

export const zCustomCall = zDecodedPropBase.extend({
  propType: z.literal(zPropType.Enum.customCall),
  address: zEthAddress.describe(addressDescription),
  cdata: zBytes.describe(cdataDescription),
}).describe(customCallDescription);
export type CustomCall = z.infer<typeof zCustomCall>;

export const zCustomCallRequest = zCustomCall.omit({ propType: true }).describe(customCallDescription);
export type CustomCallRequest = z.infer<typeof zCustomCallRequest>;

const cancelProposalDescription = `
Cancel Proposal

Cancel an onchain proposal on OREC by its id.
`

const canceledIdDescription = `
Proposal Id

Id of proposal to cancel
`
export const zCancelProposal = zDecodedPropBase.extend({
  propType: z.literal(zPropType.Enum.cancelProposal),
  canceledId: zPropId.describe(canceledIdDescription)
}).describe(cancelProposalDescription);
export type CancelProposal = z.infer<typeof zCancelProposal>;

export const zCancelProposalRequest = zCancelProposal
  .omit({ propType: true })
  .partial({ metadata: true })
  .describe(cancelProposalDescription);
export type CancelProposalRequest = z.infer<typeof zCancelProposalRequest>;

const setPeriodsDescription = `
Set Periods

Set for how long vote and veto stages last when passing proposals.
`

const newVoteLenDesc = `
Vote period (s)

Amount of time for vote stage to last in seconds
`
const newVetoLenDesc = `
Veto period (s)

Amount of time for veto stage to last in seconds
`


export const zSetPeriods = zDecodedPropBase.extend({
  propType: z.literal(zPropType.Enum.setPeriods),
  newVoteLen: zPeriodLength.describe(newVoteLenDesc),
  newVetoLen: zPeriodLength.describe(newVetoLenDesc)
}).describe(setPeriodsDescription);
export type SetPeriods = z.infer<typeof zSetPeriods>;

export const zSetPeriodsRequest = zSetPeriods
  .omit({ propType: true })
  .partial({ metadata: true })
  .describe(setPeriodsDescription);
export type SetPeriodsRequest = z.infer<typeof zSetPeriodsRequest>;

const setMinWeightDescription = `
Set Minimum Weight

Set the minimum vote weight that a proposal must acquire before it can become passing.
`

const newMinWeightDesc = `
Minimum Weight

Minimum vote weight required for a proposal to pass
`

export const zSetMinWeight = zDecodedPropBase.extend({
  propType: z.literal(zPropType.Enum.setMinWeight),
  newMinWeight: zVoteWeight.describe(newMinWeightDesc)
}).describe(setMinWeightDescription);
export type SetMinWeight = z.infer<typeof zSetMinWeight>;

export const zSetMinWeightRequest = zSetMinWeight
  .extend({
    // make it a number so that it generates a proper input form in the gui
    newMinWeight: z.number().gte(0).describe(newMinWeightDesc)
  })
  .omit({ propType: true })
  .partial({ metadata: true })
  .describe(setMinWeightDescription);
export type SetMinWeightRequest = z.infer<typeof zSetMinWeightRequest>;

const setMaxLiveYesVotesDescription = `
Set Max Live Yes Votes

Set the maximum number of simultaneous live "Yes" votes allowed per voter. This mitigates proposal spam.
`;

const newMaxLiveYesVotesDesc = `
Max Live Yes Votes

Maximum number of concurrent live Yes votes a single voter can have (0-255)
`;

export const zSetMaxLiveYesVotes = zDecodedPropBase.extend({
  propType: z.literal(zPropType.Enum.setMaxLiveYesVotes),
  newMaxLiveYesVotes: z.number().int().gte(0).lte(255).describe(newMaxLiveYesVotesDesc)
}).describe(setMaxLiveYesVotesDescription);
export type SetMaxLiveYesVotes = z.infer<typeof zSetMaxLiveYesVotes>;

export const zSetMaxLiveYesVotesRequest = zSetMaxLiveYesVotes
  .omit({ propType: true })
  .partial({ metadata: true })
  .describe(setMaxLiveYesVotesDescription);
export type SetMaxLiveYesVotesRequest = z.infer<typeof zSetMaxLiveYesVotesRequest>;

export const zDecodedProposal = z.union([
  zCustomCall,
  zTick,
  zCustomSignal,
  zBurnRespect,
  zBurnRespectBatch,
  zRespectAccountBatch,
  zRespectAccount,
  zRespectBreakout,
  zRespectBreakoutX2,
  zSetPeriods,
  zSetMinWeight,
  zSetMaxLiveYesVotes,
  zCancelProposal
]);
export type DecodedProposal = z.infer<typeof zDecodedProposal>;

export const zProposalRequest = z.union([
  zCustomCallRequest,
  zTickRequest,
  zCustomSignalRequest,
  zBurnRespectRequest,
  zBurnRespectBatchRequest,
  zRespectAccountBatchRequest,
  zRespectAccountRequest,
  zRespectBreakoutRequest,
  zRespectBreakoutX2Request,
  zSetPeriodsRequest,
  zSetMinWeightRequest,
  zSetMaxLiveYesVotesRequest,
  zCancelProposalRequest
]);
export type ProposalRequest = z.infer<typeof zProposalRequest>;

export const propSchemaMap: Record<PropType, z.AnyZodObject> = {
  "customCall": zCustomCall,
  "tick": zTick,
  "customSignal": zCustomSignal,
  "burnRespect": zBurnRespect,
  "burnRespectBatch": zBurnRespectBatch,
  "respectAccountBatch": zRespectAccountBatch,
  "respectAccount": zRespectAccount,
  "respectBreakout": zRespectBreakout,
  "respectBreakoutX2": zRespectBreakoutX2,
  "setPeriods": zSetPeriods,
  "setMinWeight": zSetMinWeight,
  "setMaxLiveYesVotes": zSetMaxLiveYesVotes,
  "cancelProposal": zCancelProposal
}

export const propRequestSchemaMap: Record<PropType, z.AnyZodObject> = {
  "tick": zTickRequest,
  "respectAccountBatch": zRespectAccountBatchRequest,
  "respectAccount": zRespectAccountRequest,
  "respectBreakout": zRespectBreakoutRequest,
  "respectBreakoutX2": zRespectBreakoutX2Request,
  "burnRespect": zBurnRespectRequest,
  "burnRespectBatch": zBurnRespectBatchRequest,
  "customCall": zCustomCallRequest,
  "customSignal": zCustomSignalRequest,
  "setPeriods": zSetPeriodsRequest,
  "setMinWeight": zSetMinWeightRequest,
  "setMaxLiveYesVotes": zSetMaxLiveYesVotesRequest,
  "cancelProposal": zCancelProposalRequest
}

export const zExecErrorType = z.nativeEnum(ErrorType);
export type ExecErrorType = z.infer<typeof zExecErrorType>;

export const zExecError = z.object({
  type: zExecErrorType,
  data: z.string().nullable(),
  name: z.string().nullable(),
  reason: z.string().nullable(),
  args: z.array(z.any()),
  signature: z.string().nullable(),  
  selector: z.string().nullable(),
})
export type ExecError = z.infer<typeof zExecError>;

export const zUnknownExecError = z.object({
  retVal: zBytes
});

export const zOnchainProp = zNOnchainProp.extend({
  voteStatus: zVoteStatus,
  stage: zStage, 
  execError: zExecError.optional(),
  yesWeight: zVoteWeight,
  noWeight: zVoteWeight,
  voteTimeLeftMs: z.function().args().returns(z.number())
    .describe("Time left in ms to vote on this proposal. Negative number means voting is over that that number of ms."),
  vetoTimeLeftMs: z.function().args().returns(z.number())
    .describe("Time left in ms to veto this proposal. Negative number means voting is over that that number of ms.")
});

export const zProposal = zOnchainProp.merge(zProposedMsgBase.partial()).extend({
  status: zExecStatus,
  decoded: zDecodedProposal.optional(),
  createTxHash: zTxHash.optional().describe("Hash of transaction which created this proposal"),
  executeTxHash: zTxHash.optional().describe("Hash of transaction which executed this proposal"),
  cancelTxHash: zTxHash.optional().describe("Hash of transaction which cancelled this proposal"),
}).partial({
  noWeight: true,
  yesWeight: true,
});
export type Proposal = z.infer<typeof zProposal>;

export const zProposalMsgFull = zProposal.required({
  addr: true,
  cdata: true,
  memo: true,
})
export type ProposalMsgFull = z.infer<typeof zProposalMsgFull>;

export const zGetVotesSpec = z.object({
  before: z.date().optional(),
  limit: z.number().int().gt(0).optional(),
  propFilter: z.array(zPropId).optional(),
  voterFilter: z.array(zEthAddress).optional(),
  minWeight: zVoteWeight.optional(),
  voteType: zValidVoteType.optional()
}).strict();
export type GetVotesSpec = z.infer<typeof zGetVotesSpec>;

export const zGetProposalsSpecBase = z.object({
  execStatFilter: z.array(zExecStatus).optional(),
  voteStatFilter: z.array(zVoteStatus).optional(),
  stageFilter: z.array(zStage).optional(),
  limit: z.number().int().gt(0).optional(),
  idFilter: zTxHash.optional(),
}).strict()

export const zGetProposalsSpecBefore = zGetProposalsSpecBase.extend({
  before: zTimestamp.optional(),
}).strict();
export type GetProposalsSpecBefore = z.infer<typeof zGetProposalsSpecBefore>;

export const zGetProposalsSpecSkip = zGetProposalsSpecBase.extend({
  skip: z.number().int().gt(0).optional(),
}).strict();
export type GetProposalSpecSkip = z.infer<typeof zGetProposalsSpecSkip>;

export const zGetProposalsSpec = z.union([
  zGetProposalsSpecBefore,
  zGetProposalsSpecSkip,
  zGetProposalsSpecBase,
]);
export type GetProposalsSpec = z.infer<typeof zGetProposalsSpec>;

export function isGetPropSpecBefore(spec: GetProposalsSpec): spec is GetProposalsSpecBefore {
  return 'before' in spec;
}

export function isGetPropSpecSkip(spec: GetProposalsSpec): spec is GetProposalSpecSkip {
  return 'skip' in spec;
}

// Awards pagination spec (mirror proposals: base | before | skip)
export const zGetAwardsSpecBase = z.object({
  limit: z.number().int().gt(0).optional(),
  recipient: zEthAddress.optional(),
  burned: z.boolean().optional(),
  tokenIdFilter: zTokenId.array().optional(),
}).strict();
export type GetAwardsSpecBase = z.infer<typeof zGetAwardsSpecBase>;

export const zGetAwardsSpecBefore = zGetAwardsSpecBase.extend({
  before: z.date().optional(),
}).strict();
export type GetAwardsSpecBefore = z.infer<typeof zGetAwardsSpecBefore>;

export const zGetAwardsSpecSkip = zGetAwardsSpecBase.extend({
  skip: z.number().int().gte(0).optional(),
}).strict();
export type GetAwardsSpecSkip = z.infer<typeof zGetAwardsSpecSkip>;

export const zGetAwardsSpec = z.union([
  zGetAwardsSpecBefore,
  zGetAwardsSpecSkip,
  zGetAwardsSpecBase,
]);
export type GetAwardsSpec = z.infer<typeof zGetAwardsSpec>;

export function isGetAwardsSpecBefore(spec: GetProposalsSpec): spec is GetAwardsSpecBefore {
  return 'before' in spec;
}

export function isGetAwardSpecSkip(spec: GetProposalsSpec): spec is GetAwardsSpecSkip {
  return 'skip' in spec;
}

export function isPropMsgFull(prop: Proposal): prop is ProposalMsgFull {
  return prop.addr !== undefined && prop.cdata !== undefined && prop.memo !== undefined;
}

/**
 * Converts to ProposalMsgFull without parsing, if possible.
 * Use this instead of zProposalMsgFull.parse to avoid parsing twice
 */ 
export function toPropMsgFull(prop: Proposal | ProposalMsgFull): ProposalMsgFull {
  return isPropMsgFull(prop) ? prop : zProposalMsgFull.parse(prop);
}

export type PropOfPropType<T extends PropType> =
  T extends typeof zPropType.Enum.respectBreakout ? RespectBreakout
  : T extends typeof zPropType.Enum.respectBreakoutX2 ? RespectBreakoutX2
  : T extends typeof zPropType.enum.respectAccountBatch ? RespectAccountBatch
  : T extends typeof zPropType.enum.respectAccount ? RespectAccount
  : T extends typeof zPropType.Enum.burnRespect ? BurnRespect
  : T extends typeof zPropType.Enum.burnRespectBatch ? BurnRespectBatch
  : T extends typeof zPropType.Enum.customSignal ? CustomSignal
  : T extends typeof zPropType.Enum.customCall ? CustomCall
  : T extends typeof zPropType.Enum.tick ? Tick
  : T extends typeof zPropType.Enum.setPeriods ? SetPeriods
  : T extends typeof zPropType.Enum.setMinWeight ? SetMinWeight
  : T extends typeof zPropType.Enum.setMaxLiveYesVotes ? SetMaxLiveYesVotes
  : T extends typeof zPropType.Enum.cancelProposal ? CancelProposal
  : never;


