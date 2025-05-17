import { zPropType } from '@ordao/ortypes';
import { propRequestSchemaMap } from '@ordao/ortypes/orclient.js';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { ProposalZodCard } from '../../components/form/ProposalZodCard';
// import { sleep } from '@ordao/ts-utils';
import FullOrclientAsserter from '../../components/FullOrclientAsserter';
import { assertOrclientBeforeLoad } from '../../global/routerContext';

export const Route = createFileRoute('/_app/newProposal/$propType/')({
  component: RouteComponent,
  beforeLoad: assertOrclientBeforeLoad,
  loader: async ({ params: { propType } }) => {
    const parsedPropType = zPropType.safeParse(propType);
    if (parsedPropType.success) {
      return { propType: parsedPropType.data }
    } else {
      throw notFound();
    }
  }
})

function RouteComponent() {
  const { propType } = Route.useLoaderData();

  const { orclient } = Route.useRouteContext();

  const navigate = Route.useNavigate();

  return (
    <FullOrclientAsserter orclient={orclient}>
      <ProposalZodCard
        schema={propRequestSchemaMap[propType]}
        propType={propType}
        onComplete={() => navigate({ to: "/" })}
        onCancel={() => navigate({ to: '/newProposal' })}
      />
    </FullOrclientAsserter>
  )
}

