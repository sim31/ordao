import { SimpleGrid } from "@chakra-ui/react";
import { propRequestSchemaMap } from "@ordao/ortypes/orclient.js";
import { ProposalReqTypeCard } from "./ProposalReqTypeCard";
import { PropType, PropTypeValues } from "@ordao/ortypes";
// import { zCustomCall } from "@ordao/ortypes/orclient.js";

interface ProposalFormMenuProps {
  onSelect: (propType: (keyof typeof propRequestSchemaMap)) => void
}

export default function ProposalFormMenu({ onSelect }: ProposalFormMenuProps) {
  const cards = PropTypeValues.map((propType: PropType) => {
    return (
      <ProposalReqTypeCard
        key={propType}
        schema={propRequestSchemaMap[propType]}
        onClick={() => onSelect(propType)}
      />
    )
  })

  return (
    <SimpleGrid minChildWidth="xs" margin="2em" gap="2em">
      {cards}
    </SimpleGrid>
  )
}