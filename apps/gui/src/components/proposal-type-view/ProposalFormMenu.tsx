import { Box, SimpleGrid, Spacer } from "@chakra-ui/react";
import { Heading } from "../Heading";
import { propRequestSchemaMap } from "@ordao/ortypes/orclient.js";
import { ProposalReqTypeCard } from "./ProposalReqTypeCard";
import { PropType, PropTypeValues, propTypeCategoryMap } from "@ordao/ortypes";
// import { zCustomCall } from "@ordao/ortypes/orclient.js";

interface ProposalFormMenuProps {
  onSelect: (propType: (keyof typeof propRequestSchemaMap)) => void
}

export default function ProposalFormMenu({ onSelect }: ProposalFormMenuProps) {
  const categoryOrder = [
    "Respect distribution",
    "Orec configuration",
    "Other",
  ] as const;

  const grouped: Record<string, PropType[]> = {};
  for (const p of PropTypeValues) {
    const cat = propTypeCategoryMap[p];
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  }

  return (
    <>
      {categoryOrder.map((category) => {
        const types = grouped[category] || [];
        if (types.length === 0) return null;
        return (
          <Box as="section" key={category}>
            <Heading as="h2" size="2xl" mx="2em" mt="2rem" mb="0.5rem">
              {category}
            </Heading>
            <Spacer />
            <SimpleGrid
              minChildWidth="xs" mx="2em" px="2em" mb="2em" gap="2em"
              borderTop="solid" borderColor="gray.200" pt="1em"
            >
              {types.map((propType: PropType) => (
                <ProposalReqTypeCard
                  key={propType}
                  schema={propRequestSchemaMap[propType]}
                  onClick={() => onSelect(propType)}
                />
              ))}
            </SimpleGrid>
          </Box>
        );
      })}
    </>
  )
}