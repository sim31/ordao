import { ContractTransactionReceipt } from "ethers";
import { Proposal, GetProposalsSpec, GetAwardsSpec, ExecError, GetVotesSpec, Vote, VoteWeight } from "@ordao/ortypes/orclient.js";
import { ORContext as ORContextOrig,
  ConfigWithOrnode,
} from "@ordao/ortypes/orContext.js";
import { RespectAwardMt, RespectFungibleMt, TokenId } from "@ordao/ortypes/respect1155.js";
import { Erc1155Mt } from "@ordao/ortypes/erc1155.js";
import { ORNodePropStatus } from "@ordao/ortypes/ornode.js";
import { NodeToClientTransformer } from "@ordao/ortypes/transformers/nodeToClientTransformer.js";
import { ClientToNodeTransformer } from "@ordao/ortypes/transformers/clientToNodeTransformer.js";
import { EthAddress, PropId } from "@ordao/ortypes";

// Re-define so that ORContext docs are included
export class ORContext extends ORContextOrig<ConfigWithOrnode> {}

/**
 * Client for reading from ORDAO system
 */
export class ORClientReader {
  protected _ctx: ORContext;
  protected _nodeToClient: NodeToClientTransformer;
  protected _clientToNode: ClientToNodeTransformer;
  protected _voteLength: number | undefined;
  protected _vetoLength: number | undefined;

  constructor(context: ORContext) {
    this._ctx = context;
    this._nodeToClient = new NodeToClientTransformer(this._ctx);
    this._clientToNode = new ClientToNodeTransformer(this._ctx);
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
   * Returns proposal by its id.
   * @param id - proposal id
   * 
   * @example
   * await c.getProposal("0x2f5e1602a2e1ccc9cf707bc57361ae6587cd87e8ae27105cae38c0db12f4fab1")
   */
  async getProposal(id: PropId): Promise<Proposal> {
    //client.provide("get", "/v1/user/retrieve", { id: "10" });
    // const response = await ornodeClient.provide("post", "/v1/getProposal", { propId: id });
    const proposal = await this._ctx.ornode.getProposal(id);
    return this._nodeToClient.transformProp(proposal);
  }

  /**
   * Returns a list of proposals ordered from latest to oldest
   * 
   * @param spec - specification for query:
   * * `before` - newest possible creation date for proposal. If specified, only proposals which were created up to this date will be returned;
   * * `limit` - maximum number of proposals to return. If not specified, it's up to ornode implementation.
   * * `execStatFilter` - list of ExecutionStatus values. Proposals which have execution status other than any of values in this list, will be filtered out. If undefined, then no filtering based on execution status is done.
   * * `voteStatFilter` - list of VoteStatus values. Proposals which have vote status other than any of values specified in the list will be filtered out (not returned). If undefined - no filtering based on vote status is done.
   * * `stageFilter` - list of Stage values. Proposals which are in stage other than any of stages specified in this list will be filtered out. If undefined - no filtering based on proposal stage is done.
   * @returns List of proposals
   * 
   * @example
   * await c.getProposals()
   */
  async getProposals(spec?: GetProposalsSpec): Promise<Proposal[]> {
    const nspec = this._clientToNode.transformGetProposalsSpec(spec ?? {});
    const nprops = await this._ctx.ornode.getProposals(nspec);
    const props: Proposal[] = [];
    for (const nprop of nprops) {
      let tprop: Proposal;
      try {
        tprop = await this._nodeToClient.transformProp(nprop);
      } catch (err: any) {
        // Sometimes ornode might store proposals which from our point of view are not onchain yet (it receives events quicker for some reason sometimes).
        // So if it is a fresh proposal and ornode returns it even though
        // it is not onchain then it is not a problem.
        // But if ornode returns an old proposal which is not onchain - then something is wrong with ornode.
        if (err.name === 'OnchainPropNotFound') {
          const now = Date.now() / 1000;
          if (nprop.createTs !== undefined && Math.abs(now - nprop.createTs) < 20) {
            continue;
          }
        }
        throw err;
      }

      const passStageFilter = 
        spec?.stageFilter === undefined ||
        spec.stageFilter.includes(tprop.stage);
      const passVoteStatFilter =
        spec?.voteStatFilter === undefined ||
        spec.voteStatFilter.includes(tprop.voteStatus);

      if (passStageFilter && passVoteStatFilter) {
        props.push(tprop);
      }
    }
    return props
  }

  /**
   * Get amount of old (parent) Respect an account has.
   */
  async getOldRespectOf(account: EthAddress): Promise<VoteWeight> {
    const oldRespect = await this._ctx.orec.respectOf(account);
    return this._nodeToClient.transformOrecVoteWeight(oldRespect);
  }

  /**
   * Get amount of Respect an account has.
   */
  async getRespectOf(account: EthAddress): Promise<bigint> {
    return await this._ctx.newRespect.respectOf(account);
  }

  /**
   * Get period number (incremented using ticks see {@link ORClient#proposeTick}).
   */
  async getPeriodNum(): Promise<number> {
    return await this._ctx.ornode.getPeriodNum();
  }

  /**
   * Get next meeting number (which is current period number + 1).
   */
  async getNextMeetingNum(): Promise<number> {
    return await this.getPeriodNum() + 1;
  }
  /**
   * Get last meeting number (which is equal to current period number).
   */
  async getLastMeetingNum(): Promise<number> {
    return await this.getPeriodNum();
  }

  /**
   * Get metadata of specific token. The token can be fungible Respect token or Respect award token (NTT).
   * 
   * @param tokenId - id of a token.
   * 
   * @remarks
   * If `tokenId` is an id of a burned token, this function might return a metadata for token which is burned onchain.
   */
  async getToken(tokenId: TokenId): Promise<Erc1155Mt> {
    return await this._ctx.ornode.getToken(tokenId);
  }

  /**
   * Get metadata of specific Respect award NTT.
   * 
   * @param tokenId - id of a token.
   * 
   * @remarks
   * If `tokenId` is an id of a burned token, this function might return a metadata for token which is burned onchain.
   */
  async getAward(tokenId: TokenId): Promise<RespectAwardMt> {
    return await this._ctx.ornode.getAward(tokenId);
  }

  /**
   * Get metadata of fungible non-transferrable Respect token.
   */
  async getRespectMetadata(): Promise<RespectFungibleMt> {
    return await this._ctx.ornode.getRespectMetadata();
  }

  /**
   * Get information on votes submitted on proposals. Votes returned are sorted from newest to oldest.
   * 
   * @param spec - specification for a query
   * * `before` - newest possible date of a vote. If specified, only votes made up to this date will be returned.
   * * `limit` - maximum number of objects to return. If not specified it is up to implementation of ornode.
   * * `propFilter` - list of proposal ids. If specified, then only votes on proposals in this list are returned.
   * * `voterFilter` - list of ethereum addresses. If specified, only votes from this list of accounts are returned.
   * * `minWeight` - minimum vote weight. If specified, only votes which have equal or greater weight are returned.
   * * `voteType` - Yes / No. If specified only votes of specified type are returned.
   * 
   * @example
   * await c.getVotes({ 
      voterFilter: [ "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "0xcd3B766CCDd6AE721141F452C550Ca635964ce71" ],
      propFilter: [ "0xcc55ee4f4b5d61a9b90b5a5d915d8e7edede19e26b1a68be043d837654313760" ],
      limit: 10,
      minWeight: 1
    })
   */
  async getVotes(spec?: GetVotesSpec): Promise<Vote[]> {
    const s = spec && this._clientToNode.transformGetVotesSpec(spec);
    const votes = await this._ctx.ornode.getVotes(s);
    return votes.map(v => this._nodeToClient.transformVote(v));
  }

  /**
   * Get metadata of Respect award NTTs, sorted from latest to oldest.
   * 
   * @param spec - specification for a query
   * * `before` - newest mint date for a token. If specified, only tokens which were created up to this date will be returned;
   * * `limit` - maximum number of tokens to return. If not specified, it's up to ornode implementation.
   * * `recipient` - recipient of the awards. If specified only awards which belong to this account are returned.
   * * `burned` - whether to return burned tokens or not. Default: false.
   * 
   * @returns list of token metadata objects sorted by mint datetime from latest to oldest.
   * 
   * @remarks
   * * By default this function does not return burned awards. Set `burned` in the spec to true to change this behaviour.
   * 
   * @example
   * await c.getAwards() // Return latest awards unfiltered
   * await c.getAwards({ before: new Date("2024-08-30T11:42:59.000Z"), limit: 50 }) // Return up to 50 awards that happened before the specified date
   * await c.getAwards({ recipient: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" }) // Get latest awards belonging to specified accounts
   */
  async getAwards(spec?: GetAwardsSpec): Promise<RespectAwardMt[]> {
    const nspec = this._clientToNode.transformGetAwardsSpec(spec ?? {});
    const awards = await this._ctx.ornode.getAwards(nspec);
    return awards;
  }

  /**
   * Get vote time remaining for a proposal (in milliseconds)
   */
  async getVoteLength(): Promise<number> {
    return await this._ctx.getVoteLength();
  }

  async getVetoLength(): Promise<number> {
    return await this._ctx.getVetoLength();
  }

  // TODO: implementations of these should probably go to orcontext like for vote/veto length
  async getMinWeight(): Promise<VoteWeight> {
    const minWeight = await this._ctx.orec.minWeight();
    return this._nodeToClient.transformOrecVoteWeight(minWeight);
  }

  async getMaxLiveYesVotes(): Promise<number> {
    return Number(await this._ctx.orec.maxLiveYesVotes());
  }
}