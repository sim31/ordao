import { Table, Text } from "@chakra-ui/react";

export function PropFieldCell({ fieldName }: { fieldName: string }) {
  return (
    <Table.Cell wordBreak={"break-word"}>
      <Text fontSize="md" fontWeight="bold">
        {fieldName}:
      </Text>
    </Table.Cell>
  );
}