# Optimistic Respect-based Executive Contract

**Optimistic Respect-based Executive Contract (OREC)** is a smart contract that executes transactions on behalf of a DAO, that has a non-transferrable reputation token (which we call “Respect” here). It enables minority of proactive contributors to act on behalf of a DAO even if they hold a small amount of Respect (hence "optimistic" in the name). The security comes from a time delay between voting and execution during which other contributors can easily block a transaction if they collectively have at least half the Respect that initiators have.

<!-- Should I put it here or somewhere else? On the other hand this doc will be linked to by other docs which define mechanisms, and you would want them to link straight to the mechanism. On the other hand, this section would make this more complete. I think I will leave this here. I think I will leave this here. Ethereum EIP / ERCs also act as specifications but they include motivation section. -->

## Motivation

<!-- TODO: Add more citations for the claims (probably want to use footnotes for this)
https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4441178 
https://limechain.tech/blog/dao-voting-mechanisms-explained-2022-guide#:~:text=Contact%20Us-,Multisig%20Voting,-Multisig%20voting%20is
-->

DAOs being an onchain organizational unit often need to execute onchain transactions as a unit. Simplest voting solutions [typically suffer from voter-apathy](https://medium.com/@fydetreasury/the-dao-governance-conundrum-part-ii-e375c240b76a). This leads to DAO setting low quorum requirements to adapt to low voter turnout, which is a compromise in security. Setting the right quorum requirement is tricky, since we typically want higher requirement for security, but setting it too high can lead to DAO getting stuck. What makes this hard is that this has to be done in advance and it is hard to predict what kind of voter participation DAO will have in the future. All of this often causes DAOs to leave control to some kind of multisignature setup by the founders, where founders are expected to execute based on poll results (instead of voters being in control directly). This protects against a DAO getting stuck, but makes it more dependent on a limited and potentially centralized set of actors.

Over the past few years a new kind of DAOs emerged called "[fractals](https://optimystics.io/blog/fractalhistory)". Their main feature relevant here is "Respect" token assigned to contributors based on community consensus about value of their contributions relative to contributions from other participants (you can read more about this mechanism [here](https://optimystics.io/respectgame)). This effectively creates a non-transferrable reputation token and gives a problem described above a slightly different twist: in this case voting power cannot be bought and it also cannot be split among many accounts belonging to the same owner (no [sybil attacks](https://en.wikipedia.org/wiki/Sybil_attack)).

## OREC approach

OREC features a novel approach to combat voter-apathy in the context of fractals with non-transferrable reputation token. It is also oriented for contexts where community uses off-chain tools to build consensus. The approach can be summarized as follows:

* Set quorum required to execute onchain transactions to be very low (to say 5%). Require supermajority of all votes (2/3 + 1) to be in favor to pass a proposal; 
* As a result, under typical low voter turnout scenario, a single bigger contributor is enough to execute transaction;
* In case a transaction which community disagrees with is proposed, rely on rest of the community to block it;
* **Make it easy to block transactions by adding a time delay between voting and execution during which only negative votes (votes "against") are accepted;**

<!-- TODO: Compare with Optimistic rollup challenge period - creation of proposal and voting after is like a time to make the claim that there's consensus and provide evidence for it, and veto period is time where this can be disputed -->
The assumption here is that community will use variety of off-chain tools to communicate as well as build consensus and OREC will be used as the last step in the decision-making process. So a vote in OREC is not a vote on idea proposals, it's a vote on whether "a proposed transaction represents consensus of the community (does community want to execute this transaction now)". This makes it much easier to rally community to block a dangerous or contentious transaction proposal. It could simply be done on the grounds that - "we need to discuss this more". But transaction proposals which haven't gone through the agreed-upon process of deliberation are unlikely to happen often in OREC, because eligible proposals can only be initiated by respected members of community (respect-holders).

<!-- In this context OREC does not require campaignign to vote. Asking for people to vote means asking people to do the work of reviewing and understanding proposals. Here we are asking people to judge if execution initiatives are justifiable and represent the community. -->

### Example scenario: last minute votes
Here's an example scenario that showcases benefits of OREC approach:

Let's say someone creates a contentious proposal (to execute some onchain action). It does not have enough votes to pass, so I don't vote "No" (it will fail anyway, and maybe I don't have access to my device or something), and I don't inform other community members about it (saving their attention span for when we really need their vote). 

If there's no veto period, there's an attack vector - people who want to pass a proposal could submit their votes last minute, just before the voting period is over, thus unexpectedly passing this contentious proposal. But with veto period, we now have room to act once we know the real voting weight behind the proposal.

To summarize: without veto period community has to be pressured to vote on everything all the time, just to be secure, which makes voter apathy problem really painful, whereas with veto period community can be mobilized only as needed.

### Scalling decentralization as needed
Sometimes community might not care about onchain presence of a DAO (what actions DAO account takes onchain), to warrant a whole onchain democratic governance process for every action a DAO takes. This is especially common if:
* DAO is new;
* DAO does not have a treasury;
* DAO does not own anything of significant value onchain;
* Some or all DAO members are new to blockchain;
* DAO is permissionless - new people can easily join without stake or commitment to participate in the future;

In cases like this, creating a decentralizied democratic voting contract, with typical quorum requirements, for executing onchain actions is often an overkill, creating a unnecessary burden on community members, who maybe just came here to experiment with other aspects of a DAO.

OREC solution enables you to start a DAO that is trully decentralized and democratic, without having to put any pressure on community to participate in onchain voting. You only need Respect distribution for your community and for you to have a sufficient amount of that Respect to pass proposals alone in case no one else is voting (how much depends on OREC configuration, but typically it's less than 5% of all Respect). That creates a setup where a single administrator can perform onchain actions on behalf of a DAO, but community can take that power away at any time, by simply actively participating in voting or (as a more long-term solution) by passing a proposal to change the respect distribution that determines vote weights.

### Execution in costly environments
"Vote only as needed" approach of OREC, combined with an additional processes and tools supporting deliberation and consensus building off-chain, makes OREC suitable for executing community consensus in environments with high transactions fees like Ethereum mainnet. Community builds consensus about what to execute off-chain, or on cheaper L2 chains and then executes that action on the Ethereum mainnet. Regardless of the process and tools being used for consensus building step, the mainnet account is still secure (from executing unwanted actions) through OREC - In case consensus building fails, it simply means more votes will be needed on the mainnet. Frontend tools could be created to help automate transition between consensus building and execution on the mainnet.


<!-- TODO: rename to OREC? -->
## Specification

### Definitions

- *Proposal* - proposal to execute some transaction. Once proposal is passed this transaction can be executed;

### Variables

- `voting_period` - first stage of proposal. Anyone can vote either `YES` or `NO` here;
- `prop_weight_threshold` - minimum amount of Respect voting `YES` for proposal to be eligible for passing;
- `veto_period` - second stage of proposal. Anyone can vote `NO` but *no one* can vote `YES`;
- `respect_contract` - contract storing Respect balances;
- `max_live_votes` - limit for how many live proposals a single account can vote `YES` on;

### Mechanism
<!-- TODO: Check if this matches implementation -->

1. Anyone can create a proposal to execute some transaction;
2. For `voting_period` from proposal creation anyone can vote `YES` or `NO` on a proposal;
3. After `voting_period` from proposal creation, anyone can vote `NO`, but no one can vote `YES` on a proposal. This lasts for `veto_period`;
4. Every vote is weighted by the amount of Respect a voter has according to `respect_contract` at the time of the vote;
5. Proposal is said to be passed if all of these conditions hold:
   1. `voting_period + veto_period` time has passed since proposal creation;
   2. At least `prop_weight_threshold` of Respect is voting `YES`;
   3. `yes_weight > 2 * no_weight`, where `yes_weight` is amount of Respect voting `YES` and `no_weight` is amount of Respect voting `NO`;
6. Only passed proposals can be executed. Execution can be trigerred only once and anyone can trigger it;
7. Proposal is said to be *failed* or *rejected* if it is past the `voting_period` and either 5.2. or 5.3. conditions are *not* satisfied;
8. Proposal is said to be expired if it is rejected or its execution has been triggered. Otherwise proposal is said to be *live*;
9. Each account can only be voting `YES` on up to `max_live_votes` *live* proposals at a time;


<!-- TODO:
* Spam prevention;
* Alternative solutions;  
* Wider applicability of OREC
* -->

## Rationale

* The purpose of 9th rule is to preven spam attacks. Without this rule, any respected member with more than `prop_weight_threshold` could spam with many proposals and force honest members to waste a lot of gas vetoing each one.
* If we consider total turnout to be union of Respect voting in both stages then a one way to think about it, is that 2/3rds + 1 of turnout is able to pass a proposal, which also means that 1/3rd of turnout is able to block it.
* In context where community builds consensus off-chain and only uses OREC for execution, veto period can be likened to a challenge period concept that other "optimistic" protocols use (e.g.: [optimistic rollups](https://ethereum.org/en/developers/docs/scaling/optimistic-rollups/#what-is-an-optimistic-rollup), [optimistic oracle](https://docs.uma.xyz/developers/osnap/osnap-proposal-verification#verifying-proposals)). In case of OREC, during challenge period community can dispute and block a transaction proposal by proving lack of consensus through negative votes on that proposal.

<!-- ## Alternative solutions

* Top-contributor model
   * Problem: no reason to think that top-contributors are best suited to pass proposals to execute transactions;
      * Reviewing proposed transactions often requires some level of technical knowledge. Top-contributors do not necessarily have it;
      * They might not be interested in getting involved in governance at all or maybe that specific domain which transaction affects does not concern them;
* Delegation. Assign roles to trusted individuals who will execute transactions on behalf of a DAO. Could be used in conjunction with top-contributor model;
   * Problem: overhead associated with electing, evaluating, changing role assignments. Can be even harder than voting on individual proposals. Introduces politics, promise-making;
   * Requires participants to be vigilant and evaluate persons elected to roles;
      * Much less-likely to work if there's no skin-in-the game and there's no skin in the game in typical fractal;
      * TODO: check your old arguments about skin in the game to Vlad
   * Still the problem of who should make the initial role assignments remains. Again top-contributors are not necessarily best-suited;
* Council solution - adaptation of top-contributor model where council is created out of top-contributors who register;
   * Problem: one council for many proposals and for many problem areas;
   * Need for additional registration step week by week, while not knowing if there will be any proposals relevant for you;
   * Small contributor who registers can have as much voting power as any other in the council;

In Orec roles can arise naturally as people take initiatives. If someone takes initiative to execute something on behalf of a DAO, they are given that power but only if others consent. -->

## Further research

<!-- Below are some things to look into further in relation to OREC. -->

### Applicability to other contexts

OREC was thought out for the context of fractals which have non-transferrable reputation token. However the general idea of "veto period" where only "no" votes are accepted might be helpful addition in other contexts as well. Furthermore, in some contexts it might be possible to replace Respect with some typical staked governance token in combination with some identity mechanism, where to have your vote weighted by your stake you would have to have some sort of soulbound token (proving unique identity or some reputation of an account). This soubound component is needed to prevent spam attacks where stake would be split over many accounts to overcome `max_live_votes` parameter and spam the system with many proposals to reject.

### Adaptive quorum biasing

[Adaptive quorum biasing](https://polkassembly.medium.com/adaptive-quorum-biasing-9b7e6d2a2261) is a voting system where required supermajority of 'yes' votes is adjusted based on the voter turnout, so that lower turnout would require bigger supermajority to vote 'yes'. This makes the voting system quite adaptive in that it can keep working under low-turnout scenario with a helpful caveat that you need active voters to have more agreement in those cases.

Currently the percentage of 'yes' votes needed to pass a proposal is fixed to 2/3+1 of all votes in OREC. OREC might benefit from using adaptive quorum biasing instead. This would make the specification a bit more complex, but could make it even more adaptive to various scenarios over time and make it more easy to configure in a secure way.

<!-- TODO: Security considerations section:
* Stability of respect distribution;
* Assumption of censorship resistance provided by underlying blockchain;
* Spam prevention; -->

<!-- TODO: Reference implementation -->
<!-- TODO: Deployments, tests? -->


<!-- Applicability to cases without a reputation token: liquid token with proof-of-human. -->
