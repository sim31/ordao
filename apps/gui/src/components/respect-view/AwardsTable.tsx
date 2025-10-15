import { Table, Box, HStack, Stack, VStack, useBreakpointValue } from "@chakra-ui/react";
import { Text } from "../Text";
import { RespectAwardMt } from "@ordao/ortypes/respect1155.js";
import { FriendlyHexString } from "../FriendlyHexString";
import { TableCell } from "../TableCell";

export interface AwardsTableProps {
  awards: RespectAwardMt["properties"][];
}

export function AwardsTable({ awards }: AwardsTableProps) {
  const isSmall = useBreakpointValue({ base: true, xl: false });

  if (isSmall) {
    return (
      <Stack gap={3}>
        <HStack justify="space-between">
          <Text fontWeight="bold">Awards ({awards.length})</Text>
        </HStack>
        <Stack gap={3}>
          {awards.map((a, idx) => (
            <Box key={idx} borderWidth="1px" rounded="md" p={3} bg="bg.canvas">
              <VStack align="stretch" gap={1}>
                <Text fontSize="sm" color="fg.muted">Token Id</Text>
                <FriendlyHexString hexStr={a.tokenId} bytes={2} />

                <Text fontSize="sm" color="fg.muted">Recipient</Text>
                <FriendlyHexString hexStr={a.recipient} bytes={2} />

                <Text fontSize="sm" color="fg.muted">Value</Text>
                <Text>{a.denomination}</Text>

                {a.title && (
                  <>
                    <Text fontSize="sm" color="fg.muted">Title</Text>
                    <Text>{a.title}</Text>
                  </>
                )}

                {a.reason && (
                  <>
                    <Text fontSize="sm" color="fg.muted">Reason</Text>
                    <Text wordBreak="break-word">{a.reason}</Text>
                  </>
                )}


                <HStack wrap="wrap" gap={4} mt={1}>
                  <HStack gap={1}>
                    <Text fontSize="sm" color="fg.muted">Mint Type</Text>
                    <Text>{a.mintType}</Text>
                  </HStack>

                  <HStack gap={1}>
                    <Text fontSize="sm" color="fg.muted">Period</Text>
                    <Text>{a.periodNumber}</Text>
                  </HStack>

                  {a.groupNum !== undefined && (
                    <HStack gap={1}>
                      <Text fontSize="sm" color="fg.muted">Group</Text>
                      <Text>{a.groupNum}</Text>
                    </HStack>
                  )}

                  {a.level !== undefined && (
                    <HStack gap={1}>
                      <Text fontSize="sm" color="fg.muted">Level</Text>
                      <Text>{a.level}</Text>
                    </HStack>
                  )}

                </HStack>

              </VStack>
            </Box>
          ))}
        </Stack>
      </Stack>
    );
  }

  return (
    <Box overflowX="auto">
      <HStack justify="space-between" mb={2}>
        <Text fontWeight="bold">Awards ({awards.length})</Text>
      </HStack>
      <Table.Root size="sm" variant="outline" minW="880px" maxWidth="100%">
        <Table.Body>
          <Table.Row bg="bg.muted">
            <TableCell style={{ wordBreak: "keep-all" }} fontWeight="bold">Recipient</TableCell>
            <TableCell style={{ wordBreak: "keep-all" }} fontWeight="bold">Value</TableCell>
            <TableCell style={{ wordBreak: "keep-all" }} fontWeight="bold">Mint type</TableCell>
            <TableCell style={{ wordBreak: "keep-all" }} fontWeight="bold">Period</TableCell>
            <TableCell style={{ wordBreak: "keep-all" }} fontWeight="bold">Group</TableCell>
            <TableCell style={{ wordBreak: "keep-all" }} fontWeight="bold">Level</TableCell>
            <TableCell style={{ wordBreak: "keep-all" }} fontWeight="bold">Title</TableCell>
            <TableCell style={{ wordBreak: "keep-all" }} fontWeight="bold">Reason</TableCell>
            <TableCell style={{ wordBreak: "keep-all" }} fontWeight="bold">Token Id</TableCell>
          </Table.Row>
          {awards.map((a, idx) => (
            <Table.Row key={idx}>
              <TableCell>
                <FriendlyHexString hexStr={a.recipient} bytes={2} />
              </TableCell>
              <TableCell>{a.denomination}</TableCell>
              <TableCell>{a.mintType}</TableCell>
              <TableCell>{a.periodNumber}</TableCell>
              <TableCell>{a.groupNum ?? ''}</TableCell>
              <TableCell>{a.level ?? ''}</TableCell>
              <TableCell>{a.title ?? ''}</TableCell>
              <TableCell wordBreak="break-word">{a.reason ?? ''}</TableCell>
              <TableCell>
                <FriendlyHexString hexStr={a.tokenId} bytes={2} />
              </TableCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
