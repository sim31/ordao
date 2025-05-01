import { createFileRoute } from '@tanstack/react-router'
import { ProposalList } from '../components/proposal-view/ProposalList'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <ProposalList />
  )
}