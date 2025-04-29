import { Card } from "@chakra-ui/react";
import { extractZodDescription } from "@ordao/zod-utils";
import { z } from "zod";

export interface ProposalReqTypeCardProps {
  schema: z.AnyZodObject
  onClick: () => void
}

export function ProposalReqTypeCard({ schema, onClick }: ProposalReqTypeCardProps) {
  const desc = extractZodDescription(schema);
  const title = desc?.title;
  const description = desc?.description;

  return (
    <Card.Root
      variant="outline"
      flexDirection="column"
      boxShadow="sm"
      onClick={onClick}
      cursor="pointer"
      size="sm"
    >
      <Card.Body>
        <Card.Title fontSize="xl" mb="1em">{title}</Card.Title>
        <Card.Description fontSize="md" wordBreak={"break-word"}>{description}</Card.Description>
      </Card.Body>
    </Card.Root>
  )
  
}