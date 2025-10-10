import { z } from "zod";
import { solidityPackedKeccak256 } from "ethers";
import { PropId, VoteType, zExecStatus, zExecStatusStr, zPropId, zProposedMsg, zStage, zValidVoteTypeStr, zVoteStatus, zVoteType, zVoteTypeStr } from "./orec.js";
import { zGroupNum, zPropType } from "./fractal.js";
import { propId } from "@ordao/orec/utils";
import { zBytesLikeToBytes, zEthAddress, zTxHash } from "./eth.js";
import { zTokenId } from "./respect1155.js";
import { zTimestamp } from "./common.js";

export const zPropContent = zProposedMsg;
export type PropContent = z.infer<typeof zPropContent>;

export const zPropAttachmentBase = z.object({
  propType: zPropType,
  propTitle: z.string().optional(),
  propDescription: z.string().optional(),
  salt: z.string().optional(),
});
export type PropAttachmentBase = z.infer<typeof zPropAttachmentBase>;

export const zRespectBreakoutAttachment = zPropAttachmentBase.extend({
  propType: z.literal(zPropType.Enum.respectBreakout),
  groupNum: zGroupNum
});
export type RespectBreakoutAttachment = z.infer<typeof zRespectBreakoutAttachment>;

export const zRespectAccountAttachment = zPropAttachmentBase.extend({
  propType: z.literal(zPropType.Enum.respectAccount),
  mintReason: z.string(),
  mintTitle: z.string(),
  groupNum: zGroupNum.optional(),
  version: z.number().int().gt(0).optional()
});
export type RespectAccountAttachment = z.infer<typeof zRespectAccountAttachment>;

export const zBurnRespectAttachment = zPropAttachmentBase.extend({
  propType: z.literal(zPropType.Enum.burnRespect),
  burnReason: z.string()
});
export type BurnRespectAttachment = z.infer<typeof zBurnRespectAttachment>;

export const zBurnRespectBatchAttachment = zPropAttachmentBase.extend({
  propType: z.literal(zPropType.Enum.burnRespectBatch),
  burnReason: z.string()
});
export type BurnRespectBatchAttachment = z.infer<typeof zBurnRespectBatchAttachment>;

export const zCustomSignalAttachment = zPropAttachmentBase.extend({
  propType: z.literal(zPropType.Enum.customSignal),
  link: z.string().optional()
})
export type CustomSignalAttachment = z.infer<typeof zCustomSignalAttachment>;

export const zTickAttachment = zPropAttachmentBase.extend({
  propType: z.literal(zPropType.Enum.tick),
  link: z.string().optional()
})
export type TickAttachment = z.infer<typeof zTickAttachment>;

export const zCustomCallAttachment = zPropAttachmentBase.extend({
  propType: z.literal(zPropType.Enum.customCall)
})
export type CustomCallAttachment = z.infer<typeof zCustomCallAttachment>;

export const zSetPeriodsAttachment = zPropAttachmentBase.extend({
  propType: z.literal(zPropType.Enum.setPeriods),
})
export type SetPeriodsAttachment = z.infer<typeof zSetPeriodsAttachment>;

export const zSetMinWeightAttachment = zPropAttachmentBase.extend({
  propType: z.literal(zPropType.Enum.setMinWeight),
})
export type SetMinWeightAttachment = z.infer<typeof zSetMinWeightAttachment>;

export const zCancelProposalAttachment = zPropAttachmentBase.extend({
  propType: z.literal(zPropType.Enum.cancelProposal)
});
export type CancelProposalAttachment = z.infer<typeof zCancelProposalAttachment>;

export const zPropAttachment = z.union([
  zRespectBreakoutAttachment,
  zRespectAccountAttachment,
  zBurnRespectAttachment,
  zBurnRespectBatchAttachment,
  zCustomSignalAttachment,
  zTickAttachment,
  zCustomCallAttachment,
  zSetPeriodsAttachment,
  zSetMinWeightAttachment,
  zCancelProposalAttachment
]);
export type PropAttachment = z.infer<typeof zPropAttachment>;

// VoteWeight as a string **without decimals**
export const zVoteWeight = z.coerce.string();
export type VoteWeight = z.infer<typeof zVoteWeight>;

export const zVote = z.object({
  ts: zTimestamp.optional(),
  txHash: zTxHash.optional(),
  proposalId: zPropId,
  voter: zEthAddress,
  weight: zVoteWeight,
  vote: zVoteTypeStr,
  memo: z.string().optional()
});
export type Vote = z.infer<typeof zVote>;

function propIdMatchesContent(prop: ProposalBaseFull): boolean {
  const pid = propId(prop.content);
  return prop.id === pid;
}

export type ZProposalType = 
    typeof zProposalBaseFull | typeof zRespectBreakout
    | typeof zRespectAccount | typeof zBurnRespect
    | typeof zCustomSignal | typeof zCustomCall
    | typeof zTick | typeof zProposalFull;

const propIdErr = { message: "proposal content does not match its id" };  
function attachPropIdMatchesContent<T extends ZProposalType>(zType: T) {
  return zType.refine(propIdMatchesContent, { message: "proposal content does not match its id"});
}

function propMemoMatchesAttachment(prop: ProposalBaseFull) {
  const memo = zBytesLikeToBytes.parse(prop.content.memo); 
  return memo === attachmentId(prop.attachment);
}

const memoErr = { message: "proposal memo does not match its attachment" };
function attachPropMemoMatchesAttachment<
  T extends ZProposalType | ReturnType<typeof attachPropIdMatchesContent>
  >(zType: T) {
  return zType.refine(propMemoMatchesAttachment, memoErr);
}

function attachPropRefinements<T extends ZProposalType>(zType: T) {
  return attachPropMemoMatchesAttachment(attachPropIdMatchesContent(zType));
}

export const zProposalBase = z.object({
  id: zPropId,
  content: zPropContent.optional(),
  attachment: zPropAttachment.optional(),
  createTs: zTimestamp.optional().describe("Unix timestamp. Should match onchain createTime of proposal"),
  createTxHash: zTxHash.optional().describe("Hash of transaction which created this proposal"),
  executeTxHash: zTxHash.optional().describe("Hash of transaction which executed this proposal"),
  cancelTxHash: zTxHash.optional().describe("Hash of transaction which cancelled this proposal"),
  status: zExecStatusStr.optional()
});

export type ProposalBase = z.infer<typeof zProposalBase>;

export const zStoredProposalBase = zProposalBase.required({
  createTs: true,
  status: true,
})

export const zProposalBaseFull = zProposalBase.required({
  content: true,
  attachment: true,
});
export type ProposalBaseFull = z.infer<typeof zProposalBaseFull>;

// NOTE: this currently does not check validity of createTs, createTxHash, executeTxHash
export const zProposalBaseFullValid = attachPropRefinements(zProposalBaseFull);

export const zRespectBreakout = zProposalBaseFull.extend({
  attachment: zRespectBreakoutAttachment
});
export type RespectBreakout = z.infer<typeof zRespectBreakout>;

export const zRespectBreakoutValid = zRespectBreakout
  .refine(propIdMatchesContent, propIdErr).refine(propMemoMatchesAttachment, memoErr)
  .brand<"respectBreakoutValid">();
export type RespectBreakoutValid = z.infer<typeof zRespectBreakoutValid>;

export const zRespectAccount = zProposalBaseFull.extend({
  attachment: zRespectAccountAttachment
})
export type RespectAccount = z.infer<typeof zRespectAccount>;

export const zRespectAccountValid = zRespectAccount
  .refine(propIdMatchesContent, propIdErr).refine(propMemoMatchesAttachment, memoErr)
  .brand<"RespectAccountValid">();
export type RespectAccountValid = z.infer<typeof zRespectAccountValid>;

export const zBurnRespect = zProposalBaseFull.extend({
  attachment: zBurnRespectAttachment
});
export type BurnRespect = z.infer<typeof zBurnRespect>;

export const zBurnRespectValid = zBurnRespect
  .refine(propIdMatchesContent, propIdErr).refine(propMemoMatchesAttachment, memoErr)
  .brand<"zBurnRespectValid">();
export type BurnRespectValid = z.infer<typeof zBurnRespectValid>;

export const zBurnRespectBatch = zProposalBaseFull.extend({
  attachment: zBurnRespectBatchAttachment
});
export type BurnRespectBatch = z.infer<typeof zBurnRespectBatch>;

export const zBurnRespectBatchValid = zBurnRespectBatch
  .refine(propIdMatchesContent, propIdErr).refine(propMemoMatchesAttachment, memoErr)
  .brand<"zBurnRespectBatchValid">();
export type BurnRespectBatchValid = z.infer<typeof zBurnRespectBatchValid>;

export const zCustomSignal = zProposalBaseFull.extend({
  attachment: zCustomSignalAttachment
});
export type CustomSignal = z.infer<typeof zCustomSignal>;

export const zCustomSignalValid = zCustomSignal
  .refine(propIdMatchesContent, propIdErr).refine(propMemoMatchesAttachment, memoErr)
  .brand<"CustomSignalValid">();
export type CustomSignalValid = z.infer<typeof zCustomSignalValid>;

export const zCustomCall = zProposalBaseFull.extend({
  attachment: zCustomCallAttachment
});
export type CustomCall = z.infer<typeof zCustomCall>;

export const zCustomCallValid = zCustomCall
  .refine(propIdMatchesContent, propIdErr).refine(propMemoMatchesAttachment, memoErr)
  .brand<"CustomCallValid">();
export type CustomCallValid = z.infer<typeof zCustomCallValid>;

export const zTick = zProposalBaseFull.extend({
  attachment: zTickAttachment
});
export type Tick = z.infer<typeof zTick>;

export const zTickValid = zTick
  .refine(propIdMatchesContent, propIdErr).refine(propMemoMatchesAttachment, memoErr)
  .brand<"TickValid">();
export type TickValid = z.infer<typeof zTickValid>;

export const zSetPeriods = zProposalBaseFull.extend({
  attachment: zSetPeriodsAttachment
});
export type SetPeriods = z.infer<typeof zSetPeriods>;

export const zSetPeriodsValid = zSetPeriods
  .refine(propIdMatchesContent, propIdErr)
  .refine(propMemoMatchesAttachment, memoErr)

export const zSetMinWeight = zProposalBaseFull.extend({
  attachment: zSetMinWeightAttachment
});
export type SetMinWeight = z.infer<typeof zSetMinWeight>;

export const zSetMinWeightValid = zSetMinWeight
  .refine(propIdMatchesContent, propIdErr)
  .refine(propMemoMatchesAttachment, memoErr)

export const zCancelProposal = zProposalBaseFull.extend({
  attachment: zCancelProposalAttachment
});
export type CancelProposal = z.infer<typeof zCancelProposal>;

export const zCancelProposalValid = zCancelProposal
  .refine(propIdMatchesContent, propIdErr)
  .refine(propMemoMatchesAttachment, memoErr)

export const zProposal = z.union([
  zProposalBase,
  zProposalBaseFull,
  zRespectBreakout,
  zRespectAccount,
  zBurnRespect,
  zBurnRespectBatch,
  zCustomSignal,
  zTick,
  zCustomCall,
  zSetPeriods,
  zSetMinWeight,
  zCancelProposal
]);
export type Proposal = z.infer<typeof zProposal>;

export const zStoredProposal = z.union([
  zStoredProposalBase,
  zRespectBreakout.required({ status: true, createTs: true }),
  zRespectAccount.required({ status: true, createTs: true }),
  zBurnRespect.required({ status: true, createTs: true }),
  zBurnRespectBatch.required({ status: true, createTs: true }),
  zCustomSignal.required({ status: true, createTs: true }),
  zTick.required({ status: true, createTs: true }),
  zCustomCall.required({ status: true, createTs: true }),
  zSetPeriods.required({ status: true, createTs: true }),
  zSetMinWeight.required({ status: true, createTs: true }),
  zCancelProposal.required({ status: true, createTs: true })
]);
export type StoredProposal = z.infer<typeof zStoredProposal>;

export const zProposalFull = z.union([
  zProposalBaseFull,
  zRespectBreakout,
  zRespectAccount,
  zBurnRespect,
  zBurnRespectBatch,
  zCustomSignal,
  zTick,
  zCustomCall,
  zSetPeriods,
  zSetMinWeight,
  zCancelProposal
]);
export type ProposalFull = z.infer<typeof zProposalFull>;

export const zProposalValid = attachPropRefinements(zProposalFull).brand<"ProposalValid">();
export type ProposalValid = z.infer<typeof zProposalValid>;

export const zORNodePropStatus = z.enum(["ProposalExists", "ProposalStored"]);
export type ORNodePropStatus = z.infer<typeof zORNodePropStatus>;

export const zErrorType = z.enum([
  "ProposalNotFound",
  "ProposalNotCreated",
  "ProposalInvalid",
  "TokenNotFound"
]);
export type ErrorType = z.infer<typeof zErrorType>;

export const zGetVotesSpec = z.object({
  before: zTimestamp.optional(),
  limit: z.number().int().gt(0).optional(),
  propFilter: z.array(zPropId).optional(),
  voterFilter: z.array(zEthAddress).optional(),
  minWeight: zVoteWeight.optional(),
  voteType: zValidVoteTypeStr.optional()
}).strict();
export type GetVotesSpec = z.infer<typeof zGetVotesSpec>;

export const zGetProposalsSpecBase = z.object({
  execStatusFilter: z.array(zExecStatusStr).optional(),
  limit: z.number().int().gt(0).optional(),
  idFilter: zPropId.optional(),
}).strict()
export type GetProposalsSpecBase = z.infer<typeof zGetProposalsSpecBase>;

export const zGetProposalsSpecBefore = zGetProposalsSpecBase.extend({
  before: zTimestamp.optional(),
}).strict()
export type GetProposalsSpecBefore = z.infer<typeof zGetProposalsSpecBefore>;

export const zGetProposalsSpecSkip = zGetProposalsSpecBase.extend({
  skip: z.number().int().gt(0).optional(),
}).strict();
export type GetProposalsSpecSkip = z.infer<typeof zGetProposalsSpecSkip>;

export const zGetProposalsSpec = z.union([
  zGetProposalsSpecBefore,
  zGetProposalsSpecSkip,
  zGetProposalsSpecBase,
]);
export type GetProposalsSpec = z.infer<typeof zGetProposalsSpec>;

export const zGetAwardsSpec = z.object({
  before: zTimestamp.optional(),
  limit: z.number().int().gt(0).optional(),
  recipient: zEthAddress.optional(),
  burned: z.boolean().optional(),
  tokenIdFilter: z.array(zTokenId).optional()
}).strict();
export type GetAwardsSpec = z.infer<typeof zGetAwardsSpec>;

export function idOfRespectBreakoutAttach(attachment: RespectBreakoutAttachment) {
  const a: Required<RespectBreakoutAttachment> = {
    ...attachment,
    propTitle: attachment.propTitle ?? "",
    propDescription: attachment.propDescription ?? "",
    salt: attachment.salt ?? ""
  };

  return solidityPackedKeccak256(
    [ "string", "string", "string", "string", "uint" ],
    [ a.propType, a.propTitle, a.propDescription, a.salt, a.groupNum ]
  );
}

export function idOfRespectAccountAttachV1(attachment: RespectAccountAttachment) {
  const a: Required<Omit<RespectAccountAttachment, "version">> = {
    ...attachment,
    propTitle: attachment.propTitle ?? "",
    propDescription: attachment.propDescription ?? "",
    salt: attachment.salt ?? "",
    groupNum: attachment.groupNum ?? 0
  };

  return solidityPackedKeccak256(
    [ "string", "string", "string", "string", "string", "string", "uint"],
    [ a.propType, a.propTitle, a.propDescription, a.salt, a.mintReason, a.mintTitle, a.groupNum ]
  );
}

export function idOfRespectAccountAttachV0(attachment: RespectAccountAttachment) {
  const a: Required<Omit<RespectAccountAttachment, "version" | "groupNum">> = {
    ...attachment,
    propTitle: attachment.propTitle ?? "",
    propDescription: attachment.propDescription ?? "",
    salt: attachment.salt ?? ""
  };

  return solidityPackedKeccak256(
    [ "string", "string", "string", "string", "string", "string"],
    [ a.propType, a.propTitle, a.propDescription, a.salt, a.mintReason, a.mintTitle]
  );
}

export function idOfBurnRespectAttach(attachment: BurnRespectAttachment | BurnRespectBatchAttachment) {
  const a: Required<BurnRespectAttachment | BurnRespectBatchAttachment> = {
    ...attachment,
    propTitle: attachment.propTitle ?? "",
    propDescription: attachment.propDescription ?? "",
    salt: attachment.salt ?? ""
  };

  return solidityPackedKeccak256(
    [ "string", "string", "string", "string", "string" ],
    [ a.propType, a.propTitle, a.propDescription, a.salt, a.burnReason ]
  );
}

export function idOfCustomSignalAttach(attachment: CustomSignalAttachment | TickAttachment) {
  const a: Required<CustomSignalAttachment | TickAttachment> = {
    ...attachment,
    link: attachment.link ?? "",
    propTitle: attachment.propTitle ?? "",
    propDescription: attachment.propDescription ?? "",
    salt: attachment.salt ?? ""
  };

  return solidityPackedKeccak256(
    [ "string", "string", "string", "string", "string" ],
    [ a.propType, a.propTitle, a.propDescription, a.salt, a.link ]
  );
}

export function idOfBaseAttach(
  attachment: CustomCallAttachment | SetPeriodsAttachment | SetMinWeightAttachment | CancelProposalAttachment
) {
  const a: Required<CustomCallAttachment | SetPeriodsAttachment | SetMinWeightAttachment | CancelProposalAttachment> = {
    ...attachment,
    propTitle: attachment.propTitle ?? "",
    propDescription: attachment.propDescription ?? "",
    salt: attachment.salt ?? ""
  };

  return solidityPackedKeccak256(
    [ "string", "string", "string", "string" ],
    [ a.propType, a.propTitle, a.propDescription, a.salt ]
  );
}

export function idOfSetPeriodsAttach(attachment: SetPeriodsAttachment) {
  const a: Required<SetPeriodsAttachment> = {
    ...attachment,
    propTitle: attachment.propTitle ?? "",
    propDescription: attachment.propDescription ?? "",
    salt: attachment.salt ?? ""
  };

  return solidityPackedKeccak256(
    [ "string", "string", "string", "string" ],
    [ a.propType, a.propTitle, a.propDescription, a.salt ]
  );
}

export function attachmentId(attachment: PropAttachment) {
  switch (attachment.propType) {
    case 'respectBreakout':
      return idOfRespectBreakoutAttach(attachment);
    case 'respectAccount': {
      if (attachment.version === undefined) {
        return idOfRespectAccountAttachV0(attachment);
      } else if (attachment.version === 2) {
        return idOfRespectAccountAttachV1(attachment);
      } else {
        throw new Error("Invalid version value for RespectAccount attachment");
      }
    }
    case 'burnRespect':
    case 'burnRespectBatch':
      return idOfBurnRespectAttach(attachment);
    case 'customSignal':
    case 'tick':
      return idOfCustomSignalAttach(attachment);
    case 'customCall':
    case 'setPeriods':
    case 'setMinWeight':
    case 'cancelProposal':
      return idOfBaseAttach(attachment);
    default:
      const exhaustiveCheck: never = attachment;
      throw new Error('exhaustive check failed');
  }
}

export function propContentEq(c1: PropContent, c2: PropContent): boolean {
  if (c1.addr !== c2.addr) {
    return false;
  }
  const cd1 = zBytesLikeToBytes.parse(c1.cdata);
  const cd2 = zBytesLikeToBytes.parse(c2.cdata);
  if (cd1 !== cd2) {
    return false;
  }
  const m1 = zBytesLikeToBytes.parse(c1.memo);
  const m2 = zBytesLikeToBytes.parse(c2.memo);
  return m1 === m2;
}

export function propValidlEq(p1: ProposalValid, p2: ProposalValid): boolean {
  // We know that proposals are valid. That means that memos contain hashes of attachments.
  // So if p1.content === p2.content, then attachments are equal too.
  return propContentEq(p1.content, p2.content);
}

