import { createFileRoute } from '@tanstack/react-router'
import { config } from '../../global/config'
import { zodValidator } from '@tanstack/zod-adapter'
import { PagedProposalList } from '../../components/proposal-view/PagedProposalList'
import { zSearchParams } from '../../global/proposalListSearchParams'
import { assertOrclientBeforeLoad } from '../../global/routerContext'
// import { sleep } from '@ordao/ts-utils'

export const Route = createFileRoute('/_app/proposals/')({
  component: Index,
  validateSearch: zodValidator(zSearchParams),
  loaderDeps: ({ search }) => search,
  beforeLoad: assertOrclientBeforeLoad,
  loader: (async ({ context: { orclient }, deps }) => {
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
  const { proposals } = Route.useLoaderData();

  return (
    <PagedProposalList proposals={proposals} />
  )
}
