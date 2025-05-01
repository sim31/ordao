import { SimpleGrid } from "@chakra-ui/react";
import { propRequestSchemaMap } from "@ordao/ortypes/orclient.js";
import { ProposalReqTypeCard } from "./ProposalReqTypeCard";
// import { zCustomCall } from "@ordao/ortypes/orclient.js";

export default function ProposalFormMenu() {
  const cards = Object.entries(propRequestSchemaMap).map(([key, schema]) => {
    return (
      <ProposalReqTypeCard
        key={key}
        schema={schema}
        onClick={() => console.log("Clicked: ", key)}
      />
    )
  })

  return (
    <SimpleGrid gap="2em" columns={2}>
      {cards}
    </SimpleGrid>
  )
}