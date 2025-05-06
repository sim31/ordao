import { createFileRoute } from '@tanstack/react-router'
import { FullProposalCard } from '../../components/proposal-view/FullProposalCard';
import { sleep } from '@ordao/ts-utils';

export const Route = createFileRoute('/proposal/$propId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.appContext.waitForPrivyReady();
    await sleep(1000);
    const orclient = await context.appContext.getOrclient();
    const propId = params.propId;
    const proposal = await orclient.getProposal( propId);
    return { proposal, orclient };
  }
})

function RouteComponent() {
  const { proposal, orclient } = Route.useLoaderData();

  return (
    <FullProposalCard proposal={proposal} orclient={orclient} />
  )
}
