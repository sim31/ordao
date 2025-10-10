import {
  RespectBreakout,
  zDecodedProposal,
  zRespectBreakout,
  zRespectAccount,
  Proposal,
  zProposal,
  RespectAccount,
  zBurnRespect,
  BurnRespect,
  zBurnRespectBatch,
  BurnRespectBatch,
  CustomSignal,
  zProposalMetadata,
  ProposalMetadata,
  zCustomSignal,
  CustomCall,
  zCustomCall,
  Tick,
  zTick,
  zVote,
  Vote,
  VoteType,
  zVoteType,
  Stage,
  zStage,
  ExecStatus,
  zExecStatus,
  VoteStatus,
  zVoteStatus,
  ExecError,
  zSetPeriods,
  SetPeriods,
  zVoteWeight,
  VoteWeight,
  zSetMinWeight,
  SetMinWeight,
  zCancelProposal
} from "../orclient.js";
import { zPropId } from "../orec.js";
import {
  zStoredProposal as zNProposal,
  zRespectBreakout as zNRespectBreakout,
  zRespectAccount as zNRespectAccount,
  StoredProposal as NProposal,
  zProposalValid as zNProposalFull,
  zRespectBreakoutAttachment,
  zRespectAccountAttachment,
  zBurnRespectAttachment,
  zBurnRespectBatchAttachment,
  zCustomSignalAttachment,
  zPropAttachmentBase,
  zCustomCallAttachment,
  zSetPeriodsAttachment,
  zTickAttachment,
  zVote as zNVote,
  Vote as NVote,
  zVoteWeight as zNVoteWeight,
  VoteWeight as NVoteWeight,
  zSetMinWeightAttachment,
  zCancelProposalAttachment
} from "../ornode.js";
import {
  zEthAddress,
  EthAddress,
  zBigNumberishToBigint,
  zBytesLikeToBytes,
  zBigIntToBytes32,
} from "../eth.js";
import { z } from "zod";
import { ConfigWithOrnode, ORContext as OrigORContext, OnchainPropNotFound } from "../orContext.js";
import { addCustomIssue } from "../zErrorHandling.js";
import { Optional } from "utility-types";
import { MeetingNum, Factory as Respect1155Factory, zBurnRespectArgs, zBurnRespectGroupArgs, zMeetingNum, zMintRespectArgs, zTokenIdData } from "../respect1155.js";
import { Orec__factory as OrecFactory } from "@ordao/orec/typechain-types";
import { zBreakoutMintRequest, zPropType } from "../fractal.js";
import { expect } from "chai";
import { unpackTokenId } from "@ordao/respect1155/utils/tokenId.js";
import {
  zCustomSignalType,
  zSignalArgs,
  zTickSignalType,
  VoteType as NVoteType,
  zVoteType as zNVoteType,
  Stage as NStage,
  VoteStatus as NVoteStatus,
  ExecStatus as NExecStatus,
  OnchainProp,
  voteTypeMap,
  zVoteTypeToStr,
  zSetPeriodsArgs,
  zSetMinWeightArgs,
  zVoteWeight as zOVoteWeight,
  VoteWeight as OVoteWeight,
  voteWeightToStr
} from "../orec.js";
import { NotVetoTimeError, NotVoteTimeError } from "../errors.js";
import Big from "big.js";

type ORContext = OrigORContext<ConfigWithOrnode>;

export const stageMap: Record<NStage, Stage> = {
  [NStage.Execution]: "Execution",
  [NStage.Expired]: "Expired",
  [NStage.Veto]: "Veto",
  [NStage.Voting]: "Voting"
};

export const voteStatusMap: Record<NVoteStatus, VoteStatus> = {
  [NVoteStatus.Failed]: "Failed",
  [NVoteStatus.Failing]: "Failing",
  [NVoteStatus.Passed]: "Passed",
  [NVoteStatus.Passing]: "Passing"
}

function mkzNProposalToBurnRespectBatch(orctx: ORContext) {
  return zNProposalFull.transform(async (val, ctx) => {
    try {
      const attachment = zBurnRespectBatchAttachment.parse(val.attachment);

      expect(val.content.addr).to.be.equal(
        await orctx.getNewRespectAddr(),
        "respect batch burn message expected to be addressed to newRespectAddr"
      );

      const data = zBytesLikeToBytes.parse(val.content.cdata);
      const tx = respectInterface.parseTransaction({ data });
      expect(tx?.name).to.be.equal(
        respectInterface.getFunction('burnRespectGroup').name,
        "expected burnRespectGroup function to be called"
      );

      const args = zBurnRespectGroupArgs.parse(tx?.args);
      const ids = args.ids;

      const r: BurnRespectBatch = {
        propType: zPropType.Enum.burnRespectBatch,
        tokenIds: ids.map(id => zBigIntToBytes32.parse(id)),
        reason: attachment.burnReason,
        metadata: zNAttachmentToMetadata.parse(attachment)
      };

      return r;
    } catch(err) {
      addCustomIssue(val, ctx, err, "Exception in zProposalToBurnRespectBatch");
    }
  }).pipe(zBurnRespectBatch);
}

function mkzNProposalToCancelProposal(orctx: ORContext) {
  return zNProposalFull.transform(async (val, ctx) => {
    try {
      const attachment = zCancelProposalAttachment.parse(val.attachment);

      expect(val.content.addr).to.be.equal(
        await orctx.getOrecAddr(),
        "cancel proposal supposed to be addressed to orec"
      );

      const data = zBytesLikeToBytes.parse(val.content.cdata);
      const tx = orecInterface.parseTransaction({ data });
      expect(tx?.name).to.be.equal(
        orecInterface.getFunction('cancelProposal').name,
        "expected cancelProposal function to be called"
      );

      const r = {
        propType: zPropType.Enum.cancelProposal,
        canceledId: zPropId.parse((tx?.args as any)?.[0]),
        metadata: zNAttachmentToMetadata.parse(attachment)
      };

      return r;
    } catch(err) {
      addCustomIssue(val, ctx, err, "Exception in zNProposalToCancelProposal")
    }
  }).pipe(zCancelProposal);
}

export const zNAttachmentToMetadata = zPropAttachmentBase.transform((val, ctx) => {
  const r: ProposalMetadata = {
    propTitle: val.propTitle,
    propDescription: val.propDescription
  };
  return r;
}).pipe(zProposalMetadata);

const respectInterface = Respect1155Factory.createInterface();
const orecInterface = OrecFactory.createInterface();

export const zMintArgsToRespectBreakout = zBreakoutMintRequest.transform((val, ctx) => {
  try {
    expect(val.mintRequests.length).to.be.greaterThanOrEqual(3).and.to.be.lessThanOrEqual(6);

    const rankings: EthAddress[] = [];
    let meetingNum: MeetingNum | undefined;

    for (const [i, req] of val.mintRequests.entries()) {
      const tokenIdData = unpackTokenId(req.id);
      const periodNum = zBigNumberishToBigint.parse(tokenIdData.periodNumber); 
      if (meetingNum === undefined) {
        meetingNum = zMeetingNum.parse(periodNum + 1n);
      } else {
        expect(periodNum + 1n).to.be.equal(BigInt(meetingNum));
      }
      rankings.push(tokenIdData.owner);
    }
    
    if (meetingNum !== undefined) {
      const r: Optional<RespectBreakout, 'groupNum'> = {
        propType: zPropType.Enum.respectBreakout,
        meetingNum: meetingNum,
        rankings,
        mintData: zBytesLikeToBytes.parse(val.data),
        metadata: {}
      };
      return r;
    }
  } catch (err) {
    addCustomIssue(val, ctx, err, "Exception in zMintArgsToRespectBreakout");
  }
}).pipe(zRespectBreakout.partial({ groupNum: true }));

function mkzNProposalToRespectBreakout(orctx: ORContext) {
  return zNProposalFull.transform(async (val, ctx) => {
    try {
      const attachment = zRespectBreakoutAttachment.parse(val.attachment);

      expect(val.content.addr).to.be.equal(
        await orctx.getNewRespectAddr(),
        "respect breakout message expected to be addressed to newRespectAddr"
      );

      const data = zBytesLikeToBytes.parse(val.content.cdata);
      const tx = respectInterface.parseTransaction({ data });
      expect(tx?.name).to.be.equal(
        respectInterface.getFunction('mintRespectGroup').name,
        "expected mintRespectGroup function to be called"
      );
      const respectBreakout = zMintArgsToRespectBreakout.parse(tx?.args);
      respectBreakout.groupNum = attachment.groupNum;
      respectBreakout.metadata = zNAttachmentToMetadata.parse(attachment)

      return respectBreakout;
    } catch(err) {
      addCustomIssue(val, ctx, err, "Exception in zNProposalToRespectBreakout");
    }
  }).pipe(zRespectBreakout);
}

function mkzNProposalToRespectAccount(orctx: ORContext) {
  return zNProposalFull.transform(async (val, ctx) => {
    try {
      const attachment = zRespectAccountAttachment.parse(val.attachment);

      expect(val.content.addr).to.be.equal(
        await orctx.getNewRespectAddr(),
        "respect breakout message expected to be addressed to newRespectAddr"
      );

      const data = zBytesLikeToBytes.parse(val.content.cdata);
      const tx = respectInterface.parseTransaction({ data });
      expect(tx?.name).to.be.equal(
        respectInterface.getFunction('mintRespect').name,
        "expected mintRespect function to be called"
      );

      const args = zMintRespectArgs.parse(tx?.args);

      const tdata = zTokenIdData.parse(unpackTokenId(args.request.id));

      const r: RespectAccount = {
        propType: zPropType.Enum.respectAccount,
        meetingNum: tdata.periodNumber + 1,
        mintType: tdata.mintType,
        account: tdata.owner,
        value: args.request.value,
        title: attachment.mintTitle,
        reason: attachment.mintReason,
        metadata: zNAttachmentToMetadata.parse(attachment),
        tokenId: zBigIntToBytes32.parse(args.request.id)
      }

      if (attachment.groupNum !== undefined) {
        r.groupNum = attachment.groupNum;
      }

      return r;
    } catch(err) {
      addCustomIssue(val, ctx, err, "Exception in zNProposalToRespectAccount");
    }
  }).pipe(zRespectAccount);
}

function mkzNProposalToBurnRespect(orctx: ORContext) {
  return zNProposalFull.transform(async (val, ctx) => {
    try {
      const attachment = zBurnRespectAttachment.parse(val.attachment);

      expect(val.content.addr).to.be.equal(
        await orctx.getNewRespectAddr(),
        "respect account message expected to be addressed to newRespectAddr"
      );

      const data = zBytesLikeToBytes.parse(val.content.cdata);
      const tx = respectInterface.parseTransaction({ data });
      expect(tx?.name).to.be.equal(
        respectInterface.getFunction('burnRespect').name,
        "expected burnRespect function to be called"
      );

      const args = zBurnRespectArgs.parse(tx?.args);

      const tdata = zTokenIdData.parse(unpackTokenId(args.tokenId));

      const r: BurnRespect = {
        propType: zPropType.Enum.burnRespect,
        tokenId: zBigIntToBytes32.parse(args.tokenId),
        reason: attachment.burnReason,
        metadata: zNAttachmentToMetadata.parse(attachment)
      }

      return r;
    } catch(err) {
      addCustomIssue(val, ctx, err, "Exception in zProposalToBurnRespect");
    }
  }).pipe(zBurnRespect);

}

function mkzNProposalToCustomSignal(orctx: ORContext) {
  return zNProposalFull.transform(async (val, ctx) => {
    try {
      const attachment = zCustomSignalAttachment.parse(val.attachment);

      expect(val.content.addr).to.be.equal(
        await orctx.getOrecAddr(),
        "custom signal supposed to be addressed to orec"
      );

      const data = zBytesLikeToBytes.parse(val.content.cdata);
      const tx = orecInterface.parseTransaction({ data });
      expect(tx?.name).to.be.equal(
        orecInterface.getFunction('signal').name,
        "expected signal function to be called"
      );

      const args = zSignalArgs.parse(tx?.args);
      // Throws if it is a tick signal
      const signalType = zCustomSignalType.parse(args.signalType);

      const r: CustomSignal = {
        propType: zPropType.Enum.customSignal,
        data: zBytesLikeToBytes.parse(args.data),
        link: attachment.link,
        signalType,
        metadata: zNAttachmentToMetadata.parse(attachment)
      }

      return r;
    } catch(err) {
      addCustomIssue(val, ctx, err, "Exception in zNProposalToCustomSignal");
    }
  }).pipe(zCustomSignal);
}

function mkzNProposalToTick(orctx: ORContext) {
  return zNProposalFull.transform(async (val, ctx) => {
    try {
      const attachment = zTickAttachment.parse(val.attachment);

      expect(val.content.addr).to.be.equal(
        await orctx.getOrecAddr(),
        "custom signal supposed to be addressed to orec"
      );

      const data = zBytesLikeToBytes.parse(val.content.cdata);
      const tx = orecInterface.parseTransaction({ data });
      expect(tx?.name).to.be.equal(
        orecInterface.getFunction('signal').name,
        "expected signal function to be called"
      );

      const args = zSignalArgs.parse(tx?.args);
      // Throws if it is not a tick signal
      zTickSignalType.parse(args.signalType);

      const r: Tick = {
        propType: zPropType.Enum.tick,
        data: zBytesLikeToBytes.parse(args.data),
        link: attachment.link,
        metadata: zNAttachmentToMetadata.parse(attachment)
      };

      return r;
    } catch(err) {
      addCustomIssue(val, ctx, err, "Exception in zNProposalToTick")
    }
  }).pipe(zTick);
}

function mkzNProposalToCustomCall(orctx: ORContext) {
  return zNProposalFull.transform(async (val, ctx) => {
    try{
      const attachment = zCustomCallAttachment.parse(val.attachment);

      const r: CustomCall = {
        cdata: zBytesLikeToBytes.parse(val.content.cdata),
        address: val.content.addr,
        propType: zPropType.Enum.customCall,
        metadata: zNAttachmentToMetadata.parse(attachment)
      }

      return r;
    } catch(err) {
      addCustomIssue(val, ctx, err, "Exception in zNProposalToCustomCall")
    }
  }).pipe(zCustomCall)
}

function mkzNProposalToSetPeriods(orctx: ORContext) {
  return zNProposalFull.transform(async (val, ctx) => {
    try {
      const attachment = zSetPeriodsAttachment.parse(val.attachment);

      expect(val.content.addr).to.be.equal(
        await orctx.getOrecAddr(),
        "set periods supposed to be addressed to orec"
      );

      const data = zBytesLikeToBytes.parse(val.content.cdata);
      const tx = orecInterface.parseTransaction({ data });
      expect(tx?.name).to.be.equal(
        orecInterface.getFunction('setPeriodLengths').name,
        "expected setPeriodLengths function to be called"
      );

      const args = zSetPeriodsArgs.parse(tx?.args);

      const r: SetPeriods = {
        propType: zPropType.Enum.setPeriods,
        newVoteLen: args.newVoteLen,
        newVetoLen: args.newVetoLen,
        metadata: zNAttachmentToMetadata.parse(attachment)
      };

      return r;
    } catch(err) {
      addCustomIssue(val, ctx, err, "Exception in zNProposalToTick")
    }
  }).pipe(zSetPeriods);
}

function mkzNProposalToSetMinWeight(orctx: ORContext) {
  return zNProposalFull.transform(async (val, ctx) => {
    try {
      const attachment = zSetMinWeightAttachment.parse(val.attachment);

      expect(val.content.addr).to.be.equal(
        await orctx.getOrecAddr(),
        "set min weight supposed to be addressed to orec"
      );

      const data = zBytesLikeToBytes.parse(val.content.cdata);
      const tx = orecInterface.parseTransaction({ data });
      expect(tx?.name).to.be.equal(
        orecInterface.getFunction('setMinWeight').name,
        "expected setMinWeight function to be called"
      );

      const args = zSetMinWeightArgs.parse(tx?.args);

      const r: SetMinWeight = {
        propType: zPropType.Enum.setMinWeight,
        newMinWeight: voteWeightToStr(args.newMinWeight, orctx.oldRespectDecimals),
        metadata: zNAttachmentToMetadata.parse(attachment)
      };

      return r;
    } catch(err) {
      addCustomIssue(val, ctx, err, "Exception in zNProposalToSetMinWeight")
    }
  }).pipe(zSetMinWeight);
}

function mkzNProposalToDecodedProp(orctx: ORContext) {
  const zNProposalToRespectBreakout = mkzNProposalToRespectBreakout(orctx);
  const zNProposalToRespectAccount = mkzNProposalToRespectAccount(orctx);
  const zNProposalToBurnRespect = mkzNProposalToBurnRespect(orctx);
  const zNProposalToCustomSignal = mkzNProposalToCustomSignal(orctx);
  const zNProposalToCustomCall = mkzNProposalToCustomCall(orctx);
  const zNProposalToTick = mkzNProposalToTick(orctx);
  const zNProposalToSetPeriods = mkzNProposalToSetPeriods(orctx);
  const zNProposalToSetMinWeight = mkzNProposalToSetMinWeight(orctx);
  const zNProposalToCancelProposal = mkzNProposalToCancelProposal(orctx);
  const zNProposalToBurnRespectBatch = mkzNProposalToBurnRespectBatch(orctx);

  return zNProposalFull.transform(async (val, ctx) => {
    if (val.attachment !== undefined && val) {
      switch (val.attachment.propType) {
        case 'respectBreakout':
          return await zNProposalToRespectBreakout.parseAsync(val);
        case 'respectAccount':
          return await zNProposalToRespectAccount.parseAsync(val);
        case 'burnRespect':
          return await zNProposalToBurnRespect.parseAsync(val);
        case 'burnRespectBatch':
          return await zNProposalToBurnRespectBatch.parseAsync(val);
        case 'customSignal':
          return await zNProposalToCustomSignal.parseAsync(val);
        case 'customCall':
          return await zNProposalToCustomCall.parseAsync(val);
        case 'tick':
          return await zNProposalToTick.parseAsync(val);
        case 'setPeriods':
          return await zNProposalToSetPeriods.parseAsync(val);
        case 'setMinWeight':
          return await zNProposalToSetMinWeight.parseAsync(val);
        case 'cancelProposal':
          return await zNProposalToCancelProposal.parseAsync(val);
        default: {
          const exhaustiveCheck: never = val.attachment;
          addCustomIssue(val, ctx, "Exhaustiveness check failed in zProposalToDecodedProp");
          return;
        }
      }
    }
  }).pipe(zDecodedProposal);
}

function toClientVoteWeight(weight: NVoteWeight, decimals?: number): string {
  if (decimals !== undefined && decimals !== 0) {
    Big.DP = decimals ?? 0;
    Big.RM = Big.roundDown;
    const wb = Big(weight).div(10 ** decimals)
    return wb.toString();
  } else {
    return weight.toString();
  }
}

function mkZNVoteWeightToClient(orctx: ORContext) {
  return zNVoteWeight.transform(val => {
    return toClientVoteWeight(val, orctx.oldRespectDecimals);
  }).pipe(zVoteWeight);
}

function mkZOVoteWeightToClient(orctx: ORContext) {
  return zOVoteWeight.transform(val => {
    return voteWeightToStr(val, orctx.oldRespectDecimals);
  }).pipe(zVoteWeight);
}

export const orecToClientVTMap: Record<NVoteType, VoteType> = voteTypeMap;

export const zNVoteTypeToClient = zVoteTypeToStr;

function mkZNVoteToClient(vwTransformer: ReturnType<typeof mkZNVoteWeightToClient>) {
  return zNVote.transform(val => {
    const vote: Vote = {
      ...val,
      weight: vwTransformer.parse(val.weight),
      date: val.ts ? new Date(val.ts * 1000) : undefined,
    }
    return vote;
  }).pipe(zVote);
}

export class NodeToClientTransformer {
  private _ctx: ORContext;
  private _zNProposalToDecodedProp: ReturnType<typeof mkzNProposalToDecodedProp>;
  private _zNVoteWeightToClient: ReturnType<typeof mkZNVoteWeightToClient>;
  private _zOVoteWeightToClient: ReturnType<typeof mkZOVoteWeightToClient>;
  private _zNVoteToClient: ReturnType<typeof mkZNVoteToClient>;

  constructor(context: ORContext) {
    this._ctx = context;

    this._zNProposalToDecodedProp = mkzNProposalToDecodedProp(context);
    this._zNVoteWeightToClient = mkZNVoteWeightToClient(context);
    this._zNVoteToClient = mkZNVoteToClient(this._zNVoteWeightToClient);
    this._zOVoteWeightToClient = mkZOVoteWeightToClient(context);
  }

  async getExecStatus(
    nodeProp: NProposal
  ): Promise<{ status: ExecStatus, execError?: ExecError}> {
    const status = nodeProp.status;
    const returnVal = { status };
    if (
      status === "ExecutionFailed" &&
      nodeProp.executeTxHash !== undefined &&
      this._ctx.runner.provider
    ) {
      const receipt = await this._ctx.runner.provider.getTransactionReceipt(nodeProp.executeTxHash);
      if (receipt === null) {
        console.error("Could not find transaction referenced as executeTxHash in proposal retrieved from ornode");
        return returnVal;
      }
      const filter = this._ctx.orec.filters.ExecutionFailed(nodeProp.id);
      const events = await this._ctx.orec.queryFilter(
        filter,
        receipt.blockNumber, receipt.blockNumber
      );
      if (events.length !== 1) {
        console.error("Expected one ExecutionFailed event for proposal ", nodeProp.id, ". All proposals: ", JSON.stringify(events));
        return returnVal;
      } else {
        try {
          const retVal = events[0].args.retVal;
          const error = this._ctx.errorDecoder.decodeReturnData(retVal);
          return { status, execError: error };
        } catch (err) {
          console.error("Error decoding return data: ", err);
          return returnVal;
        }
      }

    } else {
      return returnVal;
    }
  }

  async voteTimeLeftFunc(onchainProp: OnchainProp): Promise<() => number> {
    const voteLen = await this._ctx.getVoteLength();    
    return this._ctx.getVoteTimeLeftSync.bind(this._ctx, onchainProp, voteLen);
  }

  async vetoTimeLeftFunc(onchainProp: OnchainProp): Promise<() => number> {
    const voteLen = await this._ctx.getVoteLength();    
    const vetoLen = await this._ctx.getVetoLength();
    return this._ctx.getVetoTimeLeftSync.bind(this._ctx, onchainProp, voteLen, vetoLen);
  }

  transformVote(nodeVote: NVote): Vote {
    return this._zNVoteToClient.parse(nodeVote);
  }

  transformVoteWeight(nodeVoteWeight: NVoteWeight): VoteWeight {
    return this._zNVoteWeightToClient.parse(nodeVoteWeight);
  }

  transformOrecVoteWeight(voteWeight: OVoteWeight): VoteWeight {
    return this._zOVoteWeightToClient.parse(voteWeight);
  }

  async transformProp(nodeProp: NProposal): Promise<Proposal> {
    const propId = nodeProp.id;
    const { status, execError } = await this.getExecStatus(nodeProp)
    const onchainProp = status === "NotExecuted"
      ? await this._ctx.tryGetPropFromChain(propId) : undefined;
    let rProp: Proposal;
    if (onchainProp === undefined) {
      if (status === "NotExecuted") {
        throw new OnchainPropNotFound(nodeProp.id);
      }
      rProp = {
        id: nodeProp.id,
        status,
        execError,
        voteStatus: "Passed",   // If execution happened, it was passed
        stage: "Expired",       // If execution happened it is expired
        createTime: new Date(nodeProp.createTs * 1000),
        voteTimeLeftMs: () => { throw new NotVoteTimeError() },
        vetoTimeLeftMs: () => { throw new NotVetoTimeError() },
      };
      
    } else {
      rProp = {
        ...onchainProp,
        yesWeight: this._zOVoteWeightToClient.parse(onchainProp.yesWeight),
        noWeight: this._zOVoteWeightToClient.parse(onchainProp.noWeight),
        status: status,
        execError,
        stage: stageMap[onchainProp.stage],
        voteStatus: voteStatusMap[onchainProp.voteStatus],
        voteTimeLeftMs: await this.voteTimeLeftFunc(onchainProp),
        vetoTimeLeftMs: await this.vetoTimeLeftFunc(onchainProp),
      };
    }

    rProp.createTxHash = nodeProp.createTxHash;
    rProp.executeTxHash = nodeProp.executeTxHash;
    rProp.cancelTxHash = (nodeProp as any).cancelTxHash;

    if (nodeProp.content !== undefined) {
      rProp.addr = nodeProp.content.addr;
      rProp.cdata = nodeProp.content.cdata;
      rProp.memo = nodeProp.content.memo;
      if (nodeProp.attachment !== undefined) {
        rProp.decoded = await this._zNProposalToDecodedProp.parseAsync(nodeProp);
      }
    }
    return rProp;
  }
}
