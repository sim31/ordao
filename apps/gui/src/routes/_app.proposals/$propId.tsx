import { createFileRoute } from '@tanstack/react-router'
import { FullProposalCard } from '../../components/proposal-view/FullProposalCard';
import { assertOrclientBeforeLoad } from '../../global/routerContext';

export const Route = createFileRoute('/_app/proposals/$propId')({
  component: RouteComponent,
  beforeLoad: assertOrclientBeforeLoad,
  loader: async ({ context, params }) => {
    const propId = params.propId;
    const proposal = await context.orclient.getProposal(propId);
    return { proposal };
  }
})

function RouteComponent() {
  const { proposal } = Route.useLoaderData();

  return (
    <FullProposalCard proposal={proposal} />
  )
}
