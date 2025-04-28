import { ZodType, z } from "zod";
import { PropType, zGroupNum, zPropType, zRankings } from "./fractal.js";
import { zCustomSignalType, zOnchainProp as zNOnchainProp, zPropId, zProposedMsgBase } from "./orec.js";
import { zMeetingNum, zMintType, zTokenId } from "./respect1155.js";
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

export const zExecStatus = z.enum(["NotExecuted", "Executed", "ExecutionFailed"]);
export type ExecStatus = z.infer<typeof zExecStatus>;

export const zVoteWeight = z.number().int().gte(0);
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

export const zBreakoutResult = z.object({
  groupNum: zGroupNum,
  rankings: zRankings
});
export type BreakoutResult = z.infer<typeof zBreakoutResult>;

export const zRespectBreakoutRequest = zBreakoutResult.extend({
  meetingNum: zMeetingNum.optional(),
  metadata: zProposalMetadata.optional()
});
export type RespectBreakoutRequest = z.infer<typeof zRespectBreakoutRequest>;

export const zRespectBreakout = zDecodedPropBase.merge(zBreakoutResult).extend({
  propType: z.literal(zPropType.Enum.respectBreakout),
  meetingNum: zMeetingNum,
  mintData: zBytes
});
export type RespectBreakout = z.infer<typeof zRespectBreakout>;

const accountDesc = `
Account (recipient)

Address of an account that will receive Respect.
`
const valueDesc = `
Value

Value (also known as denomincation) of the Respect award to be minted. This determines the amount by which total Respect score will be increased.
`
const titleDesc = `
Title

Title of the Respect Award
`
const reasonDesc = `
Reason

More descriptive reason for the Respect Award
`

export const zRespectAccount = zDecodedPropBase.extend({
  propType: z.literal(zPropType.Enum.respectAccount),
  meetingNum: zMeetingNum,
  mintType: zMintType,
  groupNum: zGroupNum.optional(),
  account: zEthAddress.describe(accountDesc),
  value: zUint.describe(valueDesc),
  title: z.string().max(64).describe(titleDesc),
  reason: z.string().describe(reasonDesc),
  tokenId: zTokenId
});
export type RespectAccount = z.infer<typeof zRespectAccount>;

// const respectAccountRequestEx = {
//   meetingNum: 1,
//   mintType: 1,
//   account: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
//   value: 10n,
//   title

// }

const respectAccountDescription = `
Respect Account

Mint Respect to an account.
`
export const zRespectAccountRequest = zRespectAccount
  .describe(respectAccountDescription)
  .omit({ propType: true, tokenId: true })
  .partial({ mintType: true, meetingNum: true, metadata: true })
export type RespectAccountRequest = z.infer<typeof zRespectAccountRequest>;

const tokenIdDescription = `
Token ID

ID of Respect Award (soulbound token).
`
const reason = `
Reason for burning

Information for historical record.
`
const burnRespectDescription = `
Burn Respect

Burn 1 Respect award. This will also subract value of the awardfrom the total Respect score.
`
export const zBurnRespect = zDecodedPropBase.extend({
  propType: z.literal(zPropType.Enum.burnRespect),
  tokenId: zTokenId.describe(tokenIdDescription),
  reason: z.string().describe(reason)
})
export type BurnRespect = z.infer<typeof zBurnRespect>;

export const zBurnRespectRequest = zBurnRespect
  .omit({ propType: true })
  .partial({ metadata: true })
  .describe(burnRespectDescription);
export type BurnRespectRequest = z.infer<typeof zBurnRespectRequest>;

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
});
export type CustomSignal = z.infer<typeof zCustomSignal>;

export const zCustomSignalRequest = zCustomSignal
  .describe(customSignalDescription)
  .omit({ propType: true })
  .partial({ metadata: true });
export type CustomSignalRequest = z.infer<typeof zCustomSignalRequest>;


export const zTick = zDecodedPropBase.extend({
  propType: z.literal(zPropType.Enum.tick),
  link: z.string().optional().describe(linkDesc),
  data: zBytes.describe(signalBytesDesc)
})
export type Tick = z.infer<typeof zTick>;

const tickReqDescription = `
Tick

Increment period number (and meeting number) by 1.
`

export const zTickRequest = zTick
  .describe(tickReqDescription)
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

export const zDecodedProposal = z.union([
  zCustomCall,
  zTick,
  zCustomSignal,
  zBurnRespect,
  zRespectAccount,
  zRespectBreakout
]);
export type DecodedProposal = z.infer<typeof zDecodedProposal>;

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
});

export const zProposal = zOnchainProp.merge(zProposedMsgBase.partial()).extend({
  status: zExecStatus,
  decoded: zDecodedProposal.optional(),
  createTxHash: zTxHash.optional().describe("Hash of transaction which created this proposal"),
  executeTxHash: zTxHash.optional().describe("Hash of transaction which executed this proposal")
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

export const zGetProposalsSpec = z.object({
  before: z.date().optional(),
  limit: z.number().int().gt(0).optional(),
  execStatFilter: z.array(zExecStatus).optional(),
  voteStatFilter: z.array(zVoteStatus).optional(),
  stageFilter: z.array(zStage).optional()
}).strict();
/**
 * Some description
 */
export type GetProposalsSpec = z.infer<typeof zGetProposalsSpec>;

export const zGetAwardsSpec = z.object({
  before: z.date().optional(),
  limit: z.number().int().gt(0).optional(),
  recipient: zEthAddress.optional(),
  burned: z.boolean().optional()
}).strict();
export type GetAwardsSpec = z.infer<typeof zGetAwardsSpec>;

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
  : (T extends typeof zPropType.enum.respectAccount ? RespectAccount
    : (T extends typeof zPropType.Enum.burnRespect ? BurnRespect
      : (T extends typeof zPropType.Enum.customSignal ? CustomSignal
        : (T extends typeof zPropType.Enum.customCall ? CustomCall
          : (T extends typeof zPropType.Enum.tick ? Tick
            : never
          )
        )
      )
    )
  );


