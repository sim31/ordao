import { Badge, Flex, Text } from "@chakra-ui/react"
import { Proposal } from "@ordao/ortypes/orclient.js"
import { execStatusColors, stageColors, voteStatusColors } from "../../global/statusColors"
import { timeStr } from "../../utils/time"
import { ShortPropId } from "./ShortPropId"

export interface ProposalStatusLineProps {
  proposal: Proposal
}

export function ProposalStatusLine({ proposal }: ProposalStatusLineProps) {
  const createTime = proposal.createTime.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
  })

  return (
    <Flex gap={2} alignItems="center" mb={0.5}>
      <Badge 
        variant="solid" 
        colorPalette={stageColors[proposal.stage]} 
        size="lg"
      >
        {proposal.stage} {proposal.stage === 'Voting' || proposal.stage === 'Veto' ? `| ${timeStr(86300000)} left` : '' }
      </Badge>
      <Badge 
        variant="solid" 
        colorPalette={voteStatusColors[proposal.voteStatus]} 
        size="lg"
      >
        {proposal.voteStatus}
      </Badge>
      <Badge 
        variant={proposal.status === "NotExecuted" ? "outline" : "solid"} 
        colorPalette={execStatusColors[proposal.status]} 
        size="lg"
      >
        {proposal.status}
      </Badge>

      <Text fontSize="lg" color="gray.500">
        Created: {createTime}
      </Text>

      <ShortPropId id={proposal.id} />
      
    </Flex>

  )
}