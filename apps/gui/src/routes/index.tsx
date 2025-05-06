import { createFileRoute } from '@tanstack/react-router'
import { config } from '../global/config'
import { zodValidator } from '@tanstack/zod-adapter'
import { PagedProposalList } from '../components/proposal-view/PagedProposalList'
import { zSearchParams } from '../global/proposalListSearchParams'
import { isORClient } from '@ordao/orclient'
import { sleep } from '@ordao/ts-utils'

export const Route = createFileRoute('/')({
  component: Index,
  validateSearch: zodValidator(zSearchParams),
  loaderDeps: ({ search }) => search,
  loader: (async ({ context: { appContext }, deps }) => {
    await appContext.waitForPrivyReady();
    // TODO: Hack. Would not be needed if invalidation of context triggered a reload
    await sleep(1000);
    const orclient = await appContext.getOrclient();
    console.log("isOrclient: ", isORClient(orclient));
    const limit = deps.limit === undefined ? config.defaultPropQuerySize : deps.limit;
    const spec = {
      ...deps,
      limit,
      before: deps.before === undefined ? undefined : new Date(deps.before)
    };
    const proposals = await orclient.getProposals(spec);
    return { proposals, spec, orclient };
  }),
})

function Index() {
  const { proposals, orclient } = Route.useLoaderData();

  return (
    <PagedProposalList
      orclient={orclient}
      proposals={proposals}
    />
  )



}