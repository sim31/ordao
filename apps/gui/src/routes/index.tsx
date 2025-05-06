import { createFileRoute } from '@tanstack/react-router'
import { ProposalList } from '../components/proposal-view/ProposalList'
import { config } from '../global/config'
import { Text } from '@chakra-ui/react'

export const Route = createFileRoute('/')({
  component: Index,
  loader: (async ({ context: { appContext } }) => {
    const orclient = await appContext.getOrclient();
    const proposals = await orclient.getProposals({ limit: config.defaultPropQuerySize });
    return { proposals };
  })
})

function Index() {
  const { proposals } = Route.useLoaderData();

  if (proposals.length === 0) {
    return <Text>No proposals found</Text>
  } else {
    return (
      <ProposalList proposals={proposals}/>
    )
  }
}