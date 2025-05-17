import { Card, Center, Flex } from "@chakra-ui/react";
import { Text } from "../Text.js";
import { ProposalRequest } from "@ordao/ortypes/orclient.js";
import { extractZodDescription } from "@ordao/zod-utils";
import { z } from "zod";
import { ObjectTable } from "../proposal-view/ObjectTable";


interface ProposalFormProps<T extends z.AnyZodObject> {
  propRequest: ProposalRequest,
  schema: T,
}

export function ProposalConfirmForm<T extends z.AnyZodObject>({ schema, propRequest }: ProposalFormProps<T>) {
  const desc = extractZodDescription(schema);
  const propTitle = desc?.title;

  return (
    <Center>
      <Card.Root
        variant="outline"
        padding={4}
        gap={2}
        flexDirection="column"
        minWidth="40em"
        boxShadow="sm"
      >
        <Flex gap={2} alignItems="center" mb={2}>
          <Text fontWeight="bold" fontSize="2xl">
            {propTitle}
          </Text>
        </Flex>
        <ObjectTable obj={propRequest} />
      </Card.Root>
    </Center>
  )
}