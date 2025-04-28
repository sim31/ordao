import { Card, Center, Flex, Text } from "@chakra-ui/react";
import { z } from "zod";
import ZodForm from "../form/ZodForm";


interface ProposalFormProps<T extends z.AnyZodObject> {
  schema: T
  onSubmit: (data: z.infer<T>) => void;
}

export function ProposalForm<T extends z.AnyZodObject>({ schema, onSubmit }: ProposalFormProps<T>) {

  return (
    <Center width="100%">
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
            Burn Respect
          </Text>
        </Flex>
        <ZodForm schema={schema} onSubmit={onSubmit} />
      </Card.Root>
    </Center>
  )
}