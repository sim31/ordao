import { Table, TableCellProps } from "@chakra-ui/react";

export const TableCell = (props: TableCellProps) => {
  return <Table.Cell color="black" {...props} />;
}
