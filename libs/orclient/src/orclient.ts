import { DecodedError, ExecutedEvent, ExecutionFailedEvent, PropId, PropType, ProposalNotCreated, ProposalState, encodeVoteMemo, zBytes, zPropId } from "@ordao/ortypes";
import { BurnRespectRequest, BurnRespectBatchRequest, CustomCallRequest, CustomSignalRequest, ExecError, Proposal, ProposalRequest, RespectAccountRequest, RespectAccountBatchRequest, RespectBreakoutRequest, SetPeriodsRequest, SetMinWeightRequest, TickRequest, VoteRequest, VoteType, VoteWithProp, VoteWithPropRequest, zVoteWithProp, CancelProposalRequest, SetMaxLiveYesVotesRequest } from "@ordao/ortypes/orclient.js";
import { ProposalFull as NProp, ORNodePropStatus } from "@ordao/ortypes/ornode.js";
import { sleep, stringify } from "@ordao/ts-utils";
import { ContractTransactionReceipt, ContractTransactionResponse, Signer, toBeHex } from "ethers";
import { z } from "zod";
import { TxFailed } from "./errors.js";
import { ORClientReader, ORContext } from "./orclientReader.js";

export { ORContext }from "./orclientReader.js";


// Re-define so that ORContext docs are included
export interface Config {
  /// How many onchain confirmations to wait for before considering proposal submitted
  propConfirms: number,
  /// How many onchain confirmations to wait for, for all other transactions
  otherConfirms: number,
  propSubmitRetries: number,
  propResubmitInterval: number
}

export const defaultConfig: Config = {
  propConfirms: 1,
  otherConfirms: 1,
  propSubmitRetries: 4,
  propResubmitInterval: 3000
}

export interface OnchainActionRes {
  txReceipt: ContractTransactionReceipt
}

export interface ProposeRes extends OnchainActionRes {
  proposal: Proposal,
  status: ORNodePropStatus
}

export type ExecRes = OnchainActionRes & {
  execStatus: "Executed"
} | OnchainActionRes & {
  execStatus: "ExecutionFailed"
  execError?: ExecError
};

export function isProposalRes(res: OnchainActionRes): res is ProposeRes {
  return (res as ProposeRes).proposal !== undefined;
}

export function isExecRes(res: OnchainActionRes): res is ExecRes {
  return (res as ExecRes).execStatus !== undefined;
}

/**
 * Client for ORDAO system.
 */
export class ORClient extends ORClientReader {
  protected _cfg: Config;

  constructor(context: ORContext, cfg: Config = defaultConfig) {
    super(context);
    this._cfg = cfg;
  }

  /**
   * Return new instance that authors OREC transactions as `signer`.
   * @param signer - ethers.Signer implementation that should be used to sign transactions
   * @returns - new instance of ORClient.
   */
  connect(signer: Signer): ORClient {
    const newCtx = this._ctx.connect(signer);    
    return new ORClient(newCtx, this._cfg);
  }

  /**
   * Context for ORDAO. From it you can get components of ORDAO:
   * * Smart contracts;
   * * Contract runner;
   * * Used endpoints (for ORNode and Ethereum RPC API)
   */
  get context(): ORContext {
    return this._ctx;
  }

  /**
   * Vote on a proposal.
   * @param propId - id of a proposal to vote on.
   * @param vote - what to vote for.
   * * 'Yes' - vote for proposals;
   * * 'No' - vote against;
   * @param memo - memo text string to submit with proposal.
   * 
   * @remarks Note that memo string with go with calldata of transaction, so longer string will cost more.
   * 
   * @example
   * await c.vote("0x2f5e1602a2e1ccc9cf707bc57361ae6587cd87e8ae27105cae38c0db12f4fab1", "Yes")
   */
  async vote(propId: PropId, vote: VoteType, memo?: string): Promise<OnchainActionRes>;
  /**
   * Vote on a proposal.
   * @param request - parameters for a vote as an object. See {@link ORClient#vote}.
   * @returns hash of submitted transaction
   * 
   * @remarks Note that memo string with go with calldata of transaction, so longer string will cost more.
   * 
   * @example
   * await c.vote({
       propId: "0x2f5e1602a2e1ccc9cf707bc57361ae6587cd87e8ae27105cae38c0db12f4fab1",
       vote: "Yes",
       memo: "Optional memo"
     })
   */
  async vote(request: VoteRequest): Promise<OnchainActionRes>;
  async vote(pidOrReq: VoteRequest | PropId, vote?: VoteType, memo?: string): Promise<OnchainActionRes> {
    let req: VoteRequest;
    if (vote !== undefined && typeof pidOrReq === 'string') {
      req = { propId: pidOrReq, vote, memo }      
    } else {
      req = pidOrReq as VoteRequest;
    }
    const m = encodeVoteMemo(req.memo);
    const v = this._clientToNode.transformVoteType(req.vote);
    const orec = this._ctx.orec;
    const errMsg = `orec.vote(${req.propId}, ${v}, ${m})`
    console.debug(errMsg);
    const promise = orec.vote(req.propId, v, m);
    const txReceipt = await this._handleTxPromise(promise, this._cfg.otherConfirms, errMsg);
    return { txReceipt };
  }

  /**
   * Execute a passed proposal. Will fail if proposal is not passed yet.
   * @param propId - id of proposal to execute.
   * 
   * @example
   * await c.execute("0x2f5e1602a2e1ccc9cf707bc57361ae6587cd87e8ae27105cae38c0db12f4fab1")
   */
  async execute(propId: PropId): Promise<ExecRes> {
    const orec = this._ctx.orec;
    const nprop = await this._ctx.ornode.getProposal(propId);
    if (nprop.content !== undefined) {
      const errMsg = `orec.execute(${propId})`;
      const promise = orec.execute(nprop.content);
      const receipt = await this._handleTxPromise(promise, this._cfg.otherConfirms, errMsg);
      const ev = this._execEventFromReceipt(receipt);
      if (ev.name === "Executed") {
        return {
          txReceipt: receipt,
          execStatus: "Executed"
        }
      } else {
        const execStatus = z.literal("ExecutionFailed").parse(ev.name);
        const error = this._ctx.errorDecoder.decodeReturnData(ev.args.retVal);
        return {
          txReceipt: receipt,
          execStatus,
          execError: error
        }
      }
    } else {
      throw new Error("Don't have proposal content to execute");
    }
  }

  /**
   * Create a proposal to award respect game participants of a single breakout room, based on results of that breakout room.
   * @param request - breakout room results, plus optional metadata.
   * @param vote - vote to submit with the result. Default: `{ vote: "Yes" }`.
   * @returns resulting proposal and its status.
   * 
   * @remarks 
   * The respect amounts to award are calculated automatically based on rankings:
   * * Level 6 - 55
   * * Level 5 - 34
   * * Level 4 - 21
   * * Level 3 - 13
   * * Level 2 - 8
   * * Level 1 - 5
   * 
   * The actual onchain proposal is just for minting Respect according to distribution above.
   * 
   * If `vote` parameter is not specified "Yes" vote is submitted.
   * If you want to make this proposal but don't want to vote for it, specify `{ vote: "None" }`.
   * 
   * @example
   * 
     await c.proposeBreakoutResult(
       {
         meetingNum: 1,
         groupNum: 1,
         rankings: [
           "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
           "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
           "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
           "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
         ]
       },
       {
         memo: "Some memo",
         vote: "Yes"
       }
     )
   */
  async proposeBreakoutResult(
    request: RespectBreakoutRequest,
    vote: VoteWithPropRequest = { vote: "Yes" }
  ): Promise<ProposeRes> {
    console.debug("submitting breakout result");
    const v = zVoteWithProp.parse(vote); 
    console.debug("parsed vote");
    const proposal = await this._clientToNode.transformRespectBreakout(request);
    return await this._submitProposal(proposal, v);
  }


  /**
   * Create a proposal to award respect game participants of a single breakout room, based on results of that breakout room.
   * Double respect distribution from the standard one.
   * @param request - breakout room results, plus optional metadata.
   * @param vote - vote to submit with the result. Default: `{ vote: "Yes" }`.
   * @returns resulting proposal and its status.
   * 
   * @remarks
   * The respect amounts to award are calculated automatically based on rankings:
   * * Level 6 - 110
   * * Level 5 - 68
   * * Level 4 - 42
   * * Level 3 - 26
   * * Level 2 - 16
   * * Level 1 - 10
   * 
   * The actual onchain proposal is just for minting Respect according to distribution above.
   * 
   * If `vote` parameter is not specified "Yes" vote is submitted.
   * If you want to make this proposal but don't want to vote for it, specify `{ vote: "None" }`.
   * 
   */
  async proposeBreakoutResultX2(
    request: RespectBreakoutRequest,
    vote: VoteWithPropRequest = { vote: "Yes" }
  ): Promise<ProposeRes> {
    console.debug("submitting breakout result");
    const v = zVoteWithProp.parse(vote); 
    console.debug("parsed vote");
    const proposal = await this._clientToNode.transformRespectBreakoutX2(request);
    return await this._submitProposal(proposal, v);
  }


  /**
   * Propose to mint a single Respect award to a single account.
   * 
   * @param req - specification for the Respect award, plus optional metadata.
   * @param vote - vote to submit with the result. Default: `{ vote: "Yes" }`.
   * @returns resulting proposal and its status.
   * 
   * @remarks
   * If `vote` parameter is not specified "Yes" vote is submitted.
   * If you want to make this proposal but don't want to vote for it, specify `{ vote: "None" }`.
   * 
   * @example
   * await c.proposeRespectTo({
       meetingNum: 1,
       mintType: 1,
       account: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
       value: 10n,
       title: "Reward Title",
       reason: "Reward reason"
    })
   */
  async proposeRespectTo(
    req: RespectAccountRequest,
    vote: VoteWithPropRequest = { vote: "Yes" }
  ): Promise<ProposeRes> {
    const v = zVoteWithProp.parse(vote); 
    console.debug("parsed vote")
    const proposal = await this._clientToNode.transformRespectAccount(req);
    console.debug("transformed proposal")
    return await this._submitProposal(proposal, v);
  }

  /**
   * Propose to mint multiple Respect awards at once.
   */
  async proposeRespectAccountBatch(
    req: RespectAccountBatchRequest,
    vote: VoteWithPropRequest = { vote: "Yes" }
  ): Promise<ProposeRes> {
    const v = zVoteWithProp.parse(vote);
    const proposal = await this._clientToNode.transformRespectAccountBatch(req);
    return await this._submitProposal(proposal, v);
  }


  /**
   * Create a proposal to burn a single Respect award.
   * @param req - specification for the award to burn, plus optional metadata.
   * @param vote - vote to submit with the result. Default: `{ vote: "Yes" }`.
   * @returns resulting proposal and its status.
   * 
   * @remarks
   * If `vote` parameter is not specified "Yes" vote is submitted.
   * If you want to make this proposal but don't want to vote for it, specify `{ vote: "None" }`.
   * 
   * @example
   * await c.proposeBurnRespect(
   *   {
   *     tokenId: "0x000000010000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
   *     reason: "some optional reason"
   *   },
   *   {
   *       memo: "Some memo",
   *       vote: "Yes"
   *   }
   * );
   */
  async proposeBurnRespect(
    req: BurnRespectRequest,
    vote: VoteWithPropRequest = { vote: "Yes" }
  ): Promise<ProposeRes> {
    const v = zVoteWithProp.parse(vote); 
    const proposal = await this._clientToNode.transformBurnRespect(req);
    return await this._submitProposal(proposal, v);
  }

  /**
   * Create a proposal to burn multiple Respect awards at once.
   * @param req - specification with a list of tokenIds to burn plus optional metadata and reason.
   * @param vote - vote to submit with the result. Default: `{ vote: "Yes" }`.
   * @returns resulting proposal and its status.
   * 
   * @remarks
   * If `vote` parameter is not specified "Yes" vote is submitted.
   * If you want to make this proposal but don't want to vote for it, specify `{ vote: "None" }`.
   * 
   * @example
   * await c.proposeBurnRespectBatch({
   *   tokenIds: [
   *     "0x000000010000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
   *     "0x00000001000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8"
   *   ],
   *   reason: "cleanup"
   * })
   */
  async proposeBurnRespectBatch(
    req: BurnRespectBatchRequest,
    vote: VoteWithPropRequest = { vote: "Yes" }
  ): Promise<ProposeRes> {
    const v = zVoteWithProp.parse(vote);
    const proposal = await this._clientToNode.transformBurnRespectBatch(req);
    return await this._submitProposal(proposal, v);
  }

  /**
   * Create a proposal to issue a custom signal event from OREC contract.
   */
  async proposeCustomSignal(
    req: CustomSignalRequest,
    vote: VoteWithPropRequest = { vote: "Yes" }
  ): Promise<ProposeRes> {
    const v = zVoteWithProp.parse(vote); 
    const proposal = await this._clientToNode.transformCustomSignal(req);
    return await this._submitProposal(proposal, v);
  }

  /**
   * Create a proposal to issue a tick signal. Tick signals increment the period / meeting number returned by orclient (see {@link ORClient#getPeriodNum}).
   * 
   * @param req - optional metadata to submit with a tick signal
   * @param vote - vote to submit with the result. Default: `{ vote: "Yes" }`.
   * @returns resulting proposal and its status.
   * 
   * @remarks
   * If `vote` parameter is not specified "Yes" vote is submitted.
   * If you want to make this proposal but don't want to vote for it, specify `{ vote: "None" }`.
   * 
   * @example
   * await c.proposeTick();
   */
  async proposeTick(
    req: TickRequest = {},
    vote: VoteWithPropRequest = { vote: "Yes" }
  ): Promise<ProposeRes> {
    const v = zVoteWithProp.parse(vote); 

    if (req.data === undefined) {
      req.data = toBeHex(await this.getNextMeetingNum());
    }

    const proposal = await this._clientToNode.transformTick(req);
    return await this._submitProposal(proposal, v);
  }

  /**
   * Create a proposal to an EVM call to some contract.
   * 
   * @param req - specification for the EVM message to send.
   * @param vote - vote to submit with the result. Default: `{ vote: "Yes" }`.
   * @returns resulting proposal and its status.
   * 
   * @remarks
   * If `vote` parameter is not specified "Yes" vote is submitted.
   * If you want to make this proposal but don't want to vote for it, specify `{ vote: "None" }`.
   */
  async proposeCustomCall(
    req: CustomCallRequest,
    vote: VoteWithPropRequest = { vote: "Yes" }
  ): Promise<ProposeRes> {
    const v = zVoteWithProp.parse(vote); 
    const proposal = await this._clientToNode.transformCustomCall(req);
    return await this._submitProposal(proposal, v);
  }

  /**
   * Propose to set new vote and veto period lengths.
   * 
   * @param req - new period lengths
   * @param vote - vote to submit with the result. Default: `{ vote: "Yes" }`.
   * @returns resulting proposal and its status.
   * 
   * @remarks
   * If `vote` parameter is not specified "Yes" vote is submitted.
   * If you want to make this proposal but don't want to vote for it, specify `{ vote: "None" }`.
   */
  async proposeSetPeriods(
    req: SetPeriodsRequest,
    vote: VoteWithPropRequest = { vote: "Yes" }
  ): Promise<ProposeRes> {
    const v = zVoteWithProp.parse(vote); 
    const proposal = await this._clientToNode.transformSetPeriods(req);
    return await this._submitProposal(proposal, v);
  }

  /**
   * Propose to set new minimum passing weight (minWeight) on OREC.
   * 
   * @param req - new minimum weight
   * @param vote - vote to submit with the result. Default: `{ vote: "Yes" }`.
   * @returns resulting proposal and its status.
   * 
   * @remarks
   * If `vote` parameter is not specified "Yes" vote is submitted.
   * If you want to make this proposal but don't want to vote for it, specify `{ vote: "None" }`.
   */
  async proposeSetMinWeight(
    req: SetMinWeightRequest,
    vote: VoteWithPropRequest = { vote: "Yes" }
  ): Promise<ProposeRes> {
    const v = zVoteWithProp.parse(vote);
    const proposal = await this._clientToNode.transformSetMinWeight(req);
    return await this._submitProposal(proposal, v);
  }

  /**
   * Propose to set the maximum number of simultaneous live "Yes" votes a voter can have.
   *
   * @param req - new max live yes votes (0-255)
   * @param vote - vote to submit with the result. Default: `{ vote: "Yes" }`.
   */
  async proposeSetMaxLiveYesVotes(
    req: SetMaxLiveYesVotesRequest,
    vote: VoteWithPropRequest = { vote: "Yes" }
  ): Promise<ProposeRes> {
    const v = zVoteWithProp.parse(vote);
    const proposal = await this._clientToNode.transformSetMaxLiveYesVotes(req);
    return await this._submitProposal(proposal, v);
  }

  /**
   * Create a proposal to cancel a live proposal on OREC by its id.
   */
  async proposeCancelProposal(
    req: CancelProposalRequest,
    vote: VoteWithPropRequest = { vote: "Yes" }
  ): Promise<ProposeRes> {
    const v = zVoteWithProp.parse(vote);
    const proposal = await this._clientToNode.transformCancelProposal(req);
    return await this._submitProposal(proposal, v);
  }

  async propose(
    propType: PropType,
    req: ProposalRequest,
    vote: VoteWithPropRequest = { vote: "Yes" }
  ): Promise<ProposeRes> {
    const v = zVoteWithProp.parse(vote);
    const proposal = await this._clientToNode.transformPropRequest(propType, req);
    return await this._submitProposal(proposal, v);
  }

  private async _submitProposal(proposal: NProp, vote?: VoteWithProp): Promise<ProposeRes> {
    console.debug("submitting to chain: ", proposal);
    const receipt = await this._submitPropToChain(proposal, vote);
    proposal.createTxHash = receipt.hash;
    console.debug("submitting to ornode");
    const status = await this._submitPropToOrnode(proposal);
    console.debug("Submitted proposal id: ", proposal.id, "status: ", status);
    const cprop = await this.getProposal(proposal.id);
    return {
      proposal: cprop,
      status,
      txReceipt: receipt
    };
  }

  private async _submitPropToOrnode(proposal: NProp): Promise<ORNodePropStatus> {
    let attempts = 0;
    let _err: any;
    while (attempts < this._cfg.propSubmitRetries) {
      try {
        if (attempts > 0) {
          await sleep(this._cfg.propResubmitInterval);
        }
        const status = await this._ctx.ornode.putProposal(proposal);
        return status;
      } catch (error) {
        _err = error;
        if (error instanceof ProposalNotCreated) {
          attempts += 1;
          console.log("Submitting proposal to ornode failed with error ProposalNotCreated. Attempt count: ", attempts, ". Proposal: ", stringify(proposal));
        } else {
          throw error;
        }
      }
    }
    console.error("Attempt limit for submitting proposal exceeded.");
    throw _err;
  }

  private async _submitPropToChain(proposal: NProp, vote?: VoteWithProp) {
    const errMsg = `Submitting proposal: ${stringify(proposal)}`;
    const resp = this._submitPropTx(proposal, vote);
    return await this._handleTxPromise(resp, this._cfg.propConfirms, errMsg);
  }
  private async _submitPropTx(proposal: NProp, vote?: VoteWithProp) {
    if (vote !== undefined && vote.vote !== "None") {
      const v = this._clientToNode.transformVoteType(vote.vote);
      return this._ctx.orec.vote(
          proposal.id,
          v,
          encodeVoteMemo(vote.memo)
      );
    } else {
      return this._ctx.orec.propose(proposal.id);
    }
  }

  private async _handleTxPromise(
    promise: Promise<ContractTransactionResponse>,
    confirms: number,
    errMsg?: string
  ): Promise<ContractTransactionReceipt> {
    let resp: Awaited<typeof promise>;
    let receipt: Awaited<ReturnType<typeof resp.wait>>;
    try {
      resp = await promise;
      console.debug("Tx response: ", resp);
      receipt = await resp.wait(confirms);
      console.debug("Tx receipt: ", receipt);
    } catch(err) {
      let decoded: DecodedError;
      try {
        decoded = await this._ctx.errorDecoder.decode(err);
      } catch(err2) {
        throw new TxFailed(err2, undefined, `Error decoding error. errMsg: ${errMsg}`);
      }
      throw new TxFailed(err, decoded, errMsg);
    }
    if (receipt === null || receipt.status !== 1) {
      throw new TxFailed(resp, receipt, errMsg);
    }
    return receipt;
  }

  private _execEventFromReceipt(
    receipt: ContractTransactionReceipt
  ): {
    name: "Executed" | "ExecutionFailed",
    args: ExecutedEvent.OutputObject | ExecutionFailedEvent.OutputObject
  } {

    const execSig = "Executed(bytes32,bytes)";
    const execFailedSig = "ExecutionFailed(bytes32,bytes)";
    const _c1 = this._ctx.orec.filters[execSig];
    const _c2 = this._ctx.orec.filters[execFailedSig];

    const events: ReturnType<ORClient["_execEventFromReceipt"]>[] = [];
    for (const log of receipt.logs) {
      const ld = this._ctx.orec.interface.parseLog(log);
      if (ld?.signature === execSig) {
        events.push({
          name: "Executed",
          args: {
            propId: zPropId.parse(ld.args[0]),
            retVal: zBytes.parse(ld.args[1]),
          }
        })
      } else if (ld?.signature === execFailedSig) {
        events.push({
          name: "ExecutionFailed",
          args: {
            propId: zPropId.parse(ld.args[0]),
            retVal: zBytes.parse(ld.args[1])
          }
        })
      }
    }

    if (events.length > 1) {
      throw new Error(`More than one exec event in tx. Receipt: ${stringify(receipt)}. Events: ${stringify(events)}`);
    } else if (events.length < 1) {
      throw new Error("Execution did not trigger any exec events");
    } else {
      return events[0];
    }
  }
}
