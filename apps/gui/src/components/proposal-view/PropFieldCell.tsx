import { Table, Text } from "@chakra-ui/react";

export function PropFieldCell({ fieldName }: { fieldName: string }) {
  return (
    <Table.Cell wordBreak="normal">
      <Text fontSize="md" fontWeight="bold">
        {fieldName}:
      </Text>
    </Table.Cell>
  );
}