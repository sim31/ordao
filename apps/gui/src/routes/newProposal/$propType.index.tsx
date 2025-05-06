import { createFileRoute, notFound } from '@tanstack/react-router'
import { ProposalZodCard } from '../../components/form/ProposalZodCard'
import { propRequestSchemaMap } from '@ordao/ortypes/orclient.js'
import { zPropType } from '@ordao/ortypes';

export const Route = createFileRoute('/newProposal/$propType/')({
  component: RouteComponent,
  loader: ({ params: { propType } }) => {
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
  const navigate = Route.useNavigate();

  return (
    <ProposalZodCard
      schema={propRequestSchemaMap[propType]}
      onSubmit={console.log}
      onCancel={() => navigate({ to: '/newProposal' })}
    />
  )
}
