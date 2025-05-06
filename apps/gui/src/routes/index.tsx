import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { config } from '../global/config'
import { zodValidator } from '@tanstack/zod-adapter'
import { PagedProposalList } from '../components/proposal-view/PagedProposalList'
import { zSearchParams } from '../global/proposalListSearchParams'

export const Route = createFileRoute('/')({
  component: Index,
  validateSearch: zodValidator(zSearchParams),
  loaderDeps: ({ search }) => search,
  loader: (async ({ context: { appContext }, deps }) => {
    const orclient = await appContext.getOrclient();
    const limit = deps.limit === undefined ? config.defaultPropQuerySize : deps.limit;
    const spec = {
      ...deps,
      limit,
      before: deps.before === undefined ? undefined : new Date(deps.before)
    };
    const proposals = await orclient.getProposals(spec);
    return { proposals, spec };
  }),
})

function Index() {
  const { proposals, spec } = Route.useLoaderData();

  return (
    <PagedProposalList
      proposals={proposals}
      forwardEnabled={proposals.length === spec.limit}
      backEnabled={true}
    />
  )



}