import { createFileRoute, useNavigate, useRouterState } from '@tanstack/react-router'
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
    };
    const proposals = await orclient.getProposals(spec);
    const proposalsLeft = proposals.length >= limit;
    const proposalsSkipped = 'skip' in spec && spec.skip ? spec.skip : 0;
    return { proposals, spec, orclient, proposalsLeft, proposalsSkipped };
  }),
})

function Index() {
  const { proposals, proposalsLeft, proposalsSkipped, spec } = Route.useLoaderData();

  const { isLoading } = useRouterState();

  const navigate = useNavigate();

  const forwardEnabled = proposalsLeft;
  const backEnabled = !!proposalsSkipped;

  const onForward = () => {
    const skip = proposalsSkipped + config.defaultPropQuerySize;
    navigate({ to: '/proposals', search: { skip, limit: config.defaultPropQuerySize } });
  }
  
  const onBack = () => {
    const minSkip = proposalsSkipped - config.defaultPropQuerySize;
    const skip = minSkip <= 0 ? undefined : minSkip;
    navigate({ to: '/proposals', search: { skip, limit: config.defaultPropQuerySize } });
  }

  const onRefresh = () => {
    navigate({ to: '/proposals', search: spec });
  }

  return (
    <PagedProposalList
      proposals={proposals}
      forwardEnabled={forwardEnabled}
      backEnabled={backEnabled}
      onBack={onBack}
      onForward={onForward}
      onRefresh={onRefresh}
      isLoading={isLoading}
    />
  )
}
