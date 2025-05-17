import { Table } from "@chakra-ui/react";
import { Text } from "../Text";

export function PropFieldCell({ fieldName }: { fieldName: string }) {
  return (
    <Table.Cell wordBreak="normal">
      <Text fontSize="md" fontWeight="bold">
        {fieldName}:
      </Text>
    </Table.Cell>
  );
}