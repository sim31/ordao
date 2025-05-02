import { createFileRoute, useNavigate } from '@tanstack/react-router'
import ProposalFormMenu from '../../components/proposal-type-view/ProposalFormMenu'
import { PropType } from '@ordao/ortypes';

export const Route = createFileRoute('/newProposal/')({
  component: NewProposal,
})

function NewProposal() {
  const navigate = useNavigate({ from: '/newProposal' });

  const handleSelection = (propType: PropType) => {
    navigate({ to: `${propType}` });
  }

  return (
    <ProposalFormMenu onSelect={handleSelection} />
  )
}
