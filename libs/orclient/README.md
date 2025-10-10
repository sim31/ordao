# Orclient
Library for client-side Ordao apps / frontends, that abstracts all the communication with the backend and blockchain.

## Proposals

- proposeBreakoutResult
- proposeRespectTo
- proposeBurnRespect
- proposeBurnRespectBatch
- proposeCustomSignal
- proposeTick
- proposeCustomCall
- proposeSetPeriods
- proposeSetMinWeight
- proposeCancelProposal

### proposeBurnRespectBatch

Create a proposal to burn multiple Respect awards at once. Internally encodes a call to `Respect1155.burnRespectGroup` on the latest Respect contract.

Example:

```ts
await client.proposeBurnRespectBatch({
  tokenIds: [
    "0x000000010000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    "0x00000001000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8"
  ],
  reason: "cleanup",
  metadata: { propTitle: "Batch burn", propDescription: "Burning duplicate awards" }
})
```
