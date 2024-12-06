# ORDAO

<!-- TODO: link -->
ORDAO (Optimistic Respect-based DAO) is a toolset for type of DAOs which use non-transferrable reputation token (Respect). Core of ORDAO is [Optimisti Respect-based executive contract (OREC)](./docs/OREC.md), which enables DAOs to execute actions onchain in a democratic way while avoiding [voter-apathy problem](./docs/OREC.md#motivation). Broadly speaking ORDAO is OREC smart contract plus necessary tooling around it (off-chain services, libraries and frontend apps).

More specifically these are currently the main components of ORDAO:

* [Contracts](./contracts/)
  * OREC ([specification](./docs/OREC.md) and [implementation](./contracts/orec/));
  * [Respect1155](./contracts/respect1155/) - Respect token contract based on ERC-1155 standard;
* [Services](./services/)
  * [ornode](./services/ornode/) - API service for storing OREC proposals and Respect token metadata;
* [Libraries for interfacing with OREC](./libs/)
  * [orclient](./libs/orclient/) - A library for Ordao apps / frontends, that abstracts all the communication with the backend and blockchain;
  * [ortypes](./libs/ortypes) - Typescript types and helper utilities for Ordaos. Defines interfaces between orclient - ornode - contracts.
* [Apps](./apps/)
  * [gui](./apps/gui) - ORDAO frontend (currently only breakout-result submission frontend for fractals is implemented);
  * [console](./apps/console/) - documentation plus console interface for orclient (allows you to interface with ORDAO through browser console).
* [Tools](./tools/) - tools, scripts and tests for development, deployment and system administration of ordao;
* [Docs](./docs/) - documentation;

```mermaid
---
title: Dependency graph
---
flowchart TD
  apps/gui --> libs/orclient
  apps/console --> libs/orclient
  apps/gui --> libs/ortypes
  apps/console --> libs/ortypes
  libs/orclient --> libs/ortypes
  services/ornode --> libs/ortypes
  libs/ortypes --> contracts/respect1155
  libs/ortypes --> contracts/orec
```

## Relationship to Optimism Fractal
ORDAO came about as an upgrade to Optimism Fractal. [Here](./docs/OF_ORDAO_UPGRADE.md) you can find comparison with older Optimism Fractal software and proposed upgrade path.

## Workflow for testing packages locally before publishing
Based on suggestion from [here](https://github.com/lerna/lerna/issues/2363).

1. Setup [verdaccio](https://verdaccio.org/docs/installation) (standard setup, no need to change defaults);
2. In a project in which you want to test the packages add .npmrc file with this line: `registry=http://localhost:4873`;
3. Run `npm run local-publish` script from ordao root; 
4. Test the packages in external project
  * Checkout out a new branch;
  * Run `npm update <pkg>...` for packages which got updated and need testing. See that required packages got updated;
  * Do the tests;
5. If packages work as expected
  * Run `npm run local-unpublish-all` to cleanup verdacio registry;
  * Discard changes to ordao repo that `local-publish` script made (should be changes to lerna.json and package-lock.json);
  * Run `npm run publish` to publish changes to public npmjs registry;
  * In the external project
    * Merge changes from the test branch into the main branch except for package-lock.json;
    * Comment out registry setting in .npmrc
    * Do `npm update <pkg>...`;
    * Test again;
    * Commit and push if needed;
6. If packages do not work as expected;
  * Make required changes in the packages;
  * Commit them without commiting `lerna.json` and `package-lock.json` (or anything else that references the new versions);
  * Go back to step 3;

