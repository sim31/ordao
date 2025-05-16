import { createFileRoute } from '@tanstack/react-router'
import { assertOrclientBeforeLoad } from '../../global/routerContext';
import { AppStateInfoTabeProps, AppStateInfoTable } from '../../components/AppStateInfoTable';

export const Route = createFileRoute('/_app/about/appState')({
  component: RouteComponent,
  beforeLoad: assertOrclientBeforeLoad,
  loader: async ({ context }) => {
    const orclient = context.orclient;
    const state: AppStateInfoTabeProps = {
      periodNumber: await orclient.getPeriodNum(),
      voteLength: await orclient.getVoteLength(),
      vetoLength: await orclient.getVetoLength(),
      minVoteWeight: await orclient.getMinWeight(),
      maxLiveYesVotes: await orclient.getMaxLiveYesVotes(),
      parentRespect: await orclient.context.getOldRespectAddr()
    }
    return { state };
  }
})

function RouteComponent() {
  const { state } = Route.useLoaderData();

  return <AppStateInfoTable {...state} />
}
