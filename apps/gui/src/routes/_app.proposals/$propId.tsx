import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-adapter';
import { FullProposalCard } from '../../components/proposal-view/FullProposalCard';
import { assertOrclientBeforeLoad } from '../../global/routerContext';
import { ProposalNotFound } from '@ordao/ortypes'

export const Route = createFileRoute('/_app/proposals/$propId')({
  component: RouteComponent,
  beforeLoad: assertOrclientBeforeLoad,
  validateSearch: zodValidator(z.object({ txHash: z.string().optional() })),
  loaderDeps: ({ search: { txHash } }) => ({ txHash }),
  loader: async ({ context, params, deps: { txHash } }) => {
    const propId = params.propId;

    if (txHash) {
      const proposal = await context.orclient.getProposal({ id: propId, createTxHash: txHash });
      return { proposal };
    } else {
      const proposals = await context.orclient.getProposals({ idFilter: propId });
      if (proposals.length === 0) {
        throw new ProposalNotFound(propId, txHash);
      }
      return { proposals };
    }
  }
})

function RouteComponent() {
  const data = Route.useLoaderData();

  if (data.proposal) {
    return <FullProposalCard proposal={data.proposal} />
  } else {
    return (
      <div className="flex flex-col gap-4">
        {data.proposals.map((p) => (
          <FullProposalCard key={`${p.id}-${p.createTxHash ?? ''}`} proposal={p} />
        ))}
      </div>
    )
  }
}
