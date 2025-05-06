import { createFileRoute } from '@tanstack/react-router'
import { FullProposalCard } from '../../components/proposal-view/FullProposalCard';

export const Route = createFileRoute('/proposal/$propId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const orclient = await context.appContext.getOrclient();
    const propId = params.propId;
    const proposal = await orclient.getProposal( propId);
    return { proposal };
  }
})

function RouteComponent() {
  const { proposal } = Route.useLoaderData();

  return (
    <FullProposalCard proposal={proposal} />
  )
}
