import { createFileRoute } from '@tanstack/react-router'
import ProposalFormMenu from '../components/proposal-type-view/ProposalFormMenu'

export const Route = createFileRoute('/newProposal/')({
  component: NewProposal
})

function NewProposal() {
  return (
    <ProposalFormMenu />
  )
}
