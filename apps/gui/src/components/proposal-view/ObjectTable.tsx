import { Table } from "@chakra-ui/react";
import { PropTableRow } from "./PropTableRow";

export interface ObjectTableProps {
  obj: object
}

export function ObjectTable({ obj }: ObjectTableProps) {
  const rows = Object.entries(obj).map(([key, value]) => {
    return (
      <PropTableRow key={key} fieldName={key} value={value} />
    )
  })

  return (
    <Table.Root>
      <Table.Body>
        {rows}
      </Table.Body>
    </Table.Root>
  );
}

