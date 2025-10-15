import { Box, Table } from "@chakra-ui/react";
import { FriendlyHexString } from "../FriendlyHexString";
import { TableCell } from "../TableCell";

export interface AccountRow {
  account: string;
  value: number;
  pct: number;
}

export interface AccountsTableProps {
  rows: AccountRow[];
}

export function AccountsTable({ rows }: AccountsTableProps) {
  return (
    <Box overflowX="auto" w="100%">
      <Table.Root size="sm" variant="outline" minW="720px">
        <Table.Body>
          <Table.Row bg="bg.muted">
            <TableCell fontWeight="bold">Account</TableCell>
            <TableCell fontWeight="bold">Respect</TableCell>
            <TableCell fontWeight="bold">Percent</TableCell>
          </Table.Row>
          {rows.map((r) => (
            <Table.Row key={r.account}>
              <TableCell wordBreak="break-word">
                <FriendlyHexString hexStr={r.account} bytes={3} />
              </TableCell>
              <TableCell>{r.value}</TableCell>
              <TableCell>{r.pct.toFixed(2)}%</TableCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
