import { Table, Box, HStack, Stack, VStack, Text, useBreakpointValue } from "@chakra-ui/react";
import { Button } from "../Button";
import { formatEthAddress } from "eth-address";
import { RespectAccountBatch, RespectAccountBatchRequest } from "@ordao/ortypes/orclient.js";
import { shortenId } from "../../utils/shortenId";
import { downloadText } from "../../utils/download";

export interface AwardsTableProps {
  awards: RespectAccountBatch["awards"] | RespectAccountBatchRequest["awards"]
  shortenAddrs?: boolean;
  shortenTokenIds?: boolean;
}

export function AwardsTable({ awards, shortenAddrs, shortenTokenIds }: AwardsTableProps) {
  const isSmall = useBreakpointValue({ base: true, xl: false });

  const showTokenId = awards.some((a) => 'tokenId' in a);
  const tokenId = (a: RespectAccountBatch["awards"][number] | RespectAccountBatchRequest["awards"][number]) => {
    if ('tokenId' in a) {
      return a.tokenId;
    }
    return "";
  };

  const exportCsv = () => {
    const esc = (v: unknown) => {
      const s = String(v ?? "");
      return '"' + s.replace(/\n/g, ' ').replace(/"/g, '""') + '"';
    };
    const headers = [
      "Account",
      "Value",
      "Title",
      "Reason",
      "Token Id",
      "Meeting #",
      "Mint Type",
      "Group #",
    ];
    const rows = awards.map((a) => [
      a.account,
      a.value,
      (a.title ?? "").replace(/\n/g, " "),
      (a.reason ?? "").replace(/\n/g, " "),
      tokenId(a),
      a.meetingNum ?? "",
      a.mintType ?? "",
      a.groupNum ?? "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((x) => esc(x)).join(","))].join("\n");
    downloadText("awards.csv", csv, "text/csv;charset=utf-8");
  };

  if (isSmall) {
    // Card/list layout for small screens
    return (
      <Stack gap={3}>
        <HStack justify="space-between">
          <Text fontWeight="bold">Awards ({awards.length})</Text>
          <Button size="sm" onClick={exportCsv}>Export CSV</Button>
        </HStack>
        <Stack gap={3}>
          {awards.map((a, idx) => (
            <Box key={idx} borderWidth="1px" rounded="md" p={3} bg="bg.canvas">
              <VStack align="stretch" gap={1}>
                <Text fontSize="sm" color="fg.muted">Account</Text>
                <Text wordBreak="break-word">{shortenAddrs ? formatEthAddress(a.account, 6) : a.account}</Text>

                <Text fontSize="sm" color="fg.muted">Value</Text>
                <Text>{a.value}</Text>

                <Text fontSize="sm" color="fg.muted">Title</Text>
                <Text>{a.title}</Text>

                <Text fontSize="sm" color="fg.muted">Reason</Text>
                <Text wordBreak="break-word">{a.reason}</Text>

                {showTokenId && 
                <>
                    <Text fontSize="sm" color="fg.muted">Token Id</Text>
                    <Text wordBreak="break-word">{shortenTokenIds ? shortenId(tokenId(a), 2) : tokenId(a)}</Text>
                </>
                }

                <HStack wrap="wrap" gap={4} mt={1}>
                  {a.meetingNum !== undefined && (
                    <HStack gap={1}><Text fontSize="sm" color="fg.muted">Meeting</Text><Text>#{a.meetingNum}</Text></HStack>
                  )}
                  {a.mintType !== undefined && (
                    <HStack gap={1}><Text fontSize="sm" color="fg.muted">Mint Type</Text><Text>{a.mintType}</Text></HStack>
                  )}
                  {a.groupNum !== undefined && (
                    <HStack gap={1}><Text fontSize="sm" color="fg.muted">Group</Text><Text>{a.groupNum}</Text></HStack>
                  )}
                </HStack>
              </VStack>
            </Box>
          ))}
        </Stack>
      </Stack>
    );
  }

  // Table layout for medium+ screens
  return (
    <Box overflowX="auto">
      <HStack justify="space-between" mb={2}>
        <Text fontWeight="bold">Awards ({awards.length})</Text>
        <Button size="sm" onClick={exportCsv}>Export CSV</Button>
      </HStack>
      <Table.Root size="sm" variant="outline" minW="680px">
        <Table.Body>
          {/* header */}
          <Table.Row bg="bg.muted">
            <Table.Cell style={{ wordBreak: "keep-all" }} fontWeight="bold">Account</Table.Cell>
            <Table.Cell style={{ wordBreak: "keep-all" }} fontWeight="bold">Value</Table.Cell>
            <Table.Cell style={{ wordBreak: "keep-all" }} fontWeight="bold">Title</Table.Cell>
            <Table.Cell style={{ wordBreak: "keep-all" }} fontWeight="bold">Reason</Table.Cell>
            {showTokenId &&
              <Table.Cell style={{ wordBreak: "keep-all" }} fontWeight="bold">Token</Table.Cell>
            }
            <Table.Cell style={{ wordBreak: "keep-all" }} fontWeight="bold">Meeting</Table.Cell>
            <Table.Cell style={{ wordBreak: "keep-all" }} fontWeight="bold">Mint Type</Table.Cell>
            <Table.Cell style={{ wordBreak: "keep-all" }} fontWeight="bold">Group num</Table.Cell>
          </Table.Row>
          {awards.map((a, idx) => (
            <Table.Row key={idx}>
              <Table.Cell wordBreak="break-word">
                {shortenAddrs ? formatEthAddress(a.account, 6) : a.account}
              </Table.Cell>
              <Table.Cell>{a.value}</Table.Cell>
              <Table.Cell>{a.title}</Table.Cell>
              <Table.Cell wordBreak="break-word">{a.reason}</Table.Cell>
              {showTokenId &&
                <Table.Cell>{shortenTokenIds ? shortenId(tokenId(a), 2) : tokenId(a)}</Table.Cell>
              }
              <Table.Cell>{a.meetingNum}</Table.Cell>
              <Table.Cell>{a.mintType}</Table.Cell>
              <Table.Cell>{a.groupNum}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
