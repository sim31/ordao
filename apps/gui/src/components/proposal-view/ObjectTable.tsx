import { Table } from "@chakra-ui/react";
import { PropTableRow } from "./PropTableRow";
import { flattenObj } from "@ordao/ts-utils";

export interface ObjectTableProps {
  obj: object
}

export function ObjectTable({ obj }: ObjectTableProps) {

  const flattenedObj = flattenObj(obj);

  const rows = Object.entries(flattenedObj).map(([key, value]) => {
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

