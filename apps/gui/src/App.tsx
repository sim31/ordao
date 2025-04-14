// import { useState } from 'react'
// import './App.css'
import { Badge, Card, Flex, Text } from "@chakra-ui/react"


import { Proposal } from "@ordao/ortypes/orclient.js"
// import { Box, Center, Flex } from "@chakra-ui/react"

const proposals: Proposal[] = [
  {
    "id": "0x0661f86552cb5f50ec104ce117ef455979903e9cfd68c5f472a68f135a83470f",
    "status": "Executed",
    "voteStatus": "Passed",
    "stage": "Expired",
    "createTime": new Date(),
    "createTxHash": "0x52b391122f0e7bd34c460213ea629b7714e507d2b24a35285e2c1d821104d3ca",
    "executeTxHash": "0x566933eccc97b9605d05fe41229a8149b37789fccde25b0a043992f9ced42c52",
    "addr": "0x07418B51196045EB360F31d8881326858Ed25121",
    "cdata": "0x5da7e1d4000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001a0000000000000000000000000000000000000000000000000000000000000000500000000000000000000003bc11c6f47fe090a706ba82964b8a98f1682b244ff000000000000000000000000000000000000000000000000000000000000003700000000000000000000003b41dbc193481c10fb019cb9ceaab7caf909cb8414000000000000000000000000000000000000000000000000000000000000002200000000000000000000003b7234c36a71ec237c2ae7698e8916e0735001e9af000000000000000000000000000000000000000000000000000000000000001500000000000000000000003bc0f0e1512d6a0a77ff7b9c172405d1b0d73565bf000000000000000000000000000000000000000000000000000000000000000d00000000000000000000003be6a12a9dac726c1bf7943d6acd6f4df3ddfb0de800000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000",
    "memo": "0xfb12672f252f9ba972ef98c0fa4482ff0d203a6eaa05152ca80f51bb51307eef",
    "decoded": {
      "propType": "respectBreakout",
      "metadata": {},
      "groupNum": 1,
      "rankings": [
        "0xC11C6f47fe090a706bA82964B8A98F1682b244Ff",
        "0x41dbC193481c10Fb019Cb9Ceaab7caf909CB8414",
        "0x7234c36A71ec237c2Ae7698e8916e0735001E9Af",
        "0xc0f0E1512D6A0A77ff7b9C172405D1B0d73565Bf",
        "0xe6A12a9DAC726C1BF7943d6ACd6F4dF3ddfB0dE8"
      ],
      "meetingNum": 60,
      "mintData": "0x"
    }
  },
  {
    "id": "0x3436ed11c5301f63dcb885d7691d8fe7e8479223b647bf867543d84c66508eae",
    "createTime": new Date(),
    "yesWeight": 882n,
    "noWeight": 0n,
    "stage": "Voting",
    "voteStatus": "Passing",
    "status": "NotExecuted",
    "createTxHash": "0x85ddbfc174379a94d0536ed9f62568ac4e0ecfea3bb813f3474db73492c58fa1",
    "addr": "0x07418B51196045EB360F31d8881326858Ed25121",
    "cdata": "0xdfd469ed00000000000000000000003b2b98017359a08867d0f4060edc579d9d0585e8c1000000000000000000000000000000000000000000000000000000000000002200000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
    "memo": "0x9b148288555d531fee1eecb7e0e9037d7cee5d163b3a6bf0e2451dc3c90cae02",
    "decoded": {
      "propType": "respectAccount",
      "metadata": {},
      "meetingNum": 60,
      "mintType": 0,
      "groupNum": 2,
      "account": "0x2b98017359a08867D0f4060edC579D9d0585e8C1",
      "value": 34n,
      "title": "Respect for Level 5 in group 2 of meeting 60",
      "reason": "Re-minting to the correct account: https://discord.com/channels/1164572177115398184/1357718841353834540",
      "tokenId": "0x00000000000000000000003b2b98017359a08867d0f4060edc579d9d0585e8c1"
    }
  },
  {
    "id": "0x351f538816dd407a5cf1aed7c6af41684945a5b802d57ed07fa80d8f6c24a49c",
    "createTime": new Date(),
    "yesWeight": 882n,
    "noWeight": 0n,
    "stage": "Voting",
    "voteStatus": "Passing",
    "status": "NotExecuted",
    "createTxHash": "0x122f76b0b3ce1998904896c105e2120af7757e704db851c564a3e9facf7efc4e",
    "addr": "0x07418B51196045EB360F31d8881326858Ed25121",
    "cdata": "0xd8b947d000000000000000000000003b53f7673790fe6753ea1bb12eb55df81a46bec80a00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000",
    "memo": "0xfe97b81a658ac1b4bfee9306a6e8f498373d618159ec5df0a82cc806c36bcbf0",
    "decoded": {
      "propType": "burnRespect",
      "metadata": {},
      "tokenId": "0x00000000000000000000003b53f7673790fe6753ea1bb12eb55df81a46bec80a",
      "reason": "Wrong address used in Respect Game. https://discord.com/channels/1164572177115398184/1357718841353834540"
    }
  }
]

function ProposalCard({ proposal }: { proposal: Proposal }) {
  const shortenedId = proposal.id.slice(0, 6) + '...';

  return (
    <Card
      variant="outline"
      padding={4}
      gap={2}
      flexDirection="column"
    >

      <Flex gap={2} alignItems="center" mb={0.5}>
        <Badge variant="outline" colorScheme="green" fontSize="lg">
          {proposal.stage}
        </Badge>
        <Badge variant="outline" colorScheme="blue" fontSize="lg">
          {proposal.voteStatus}
        </Badge>
        <Badge variant="outline" colorScheme="green" fontSize="lg">
          {proposal.status}
        </Badge>
      </Flex>

      <Flex gap={2} alignItems="center" mb={2}>
        <Text fontWeight="bold" fontSize="2xl">
          {proposal.decoded?.propType || "Unknown"}
        </Text>
        <Text fontSize="lg" color="gray.500">
          Created: {proposal.createTime.toLocaleString()}
        </Text>
        <Text fontSize="lg" color="gray.500">
          ID: {shortenedId}
        </Text>
      </Flex>

      <Flex flexDirection="column" gap={2}>
        {proposal.decoded?.metadata && (
          <Text fontSize="md">
            Metadata: {JSON.stringify(proposal.decoded.metadata)}
          </Text>
        )}

        {proposal.decoded?.propType === 'respectBreakout' && (
          <>
            <Flex justifyContent="space-between">
              <Text fontSize="md" fontWeight="bold">
                Meeting Num:
              </Text>
              <Text fontSize="md" textAlign="right">
                {proposal.decoded.meetingNum}
              </Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text fontSize="md" fontWeight="bold">
                Group Num:
              </Text>
              <Text fontSize="md" textAlign="right">
                {proposal.decoded.groupNum}
              </Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text fontSize="md" fontWeight="bold">
                Rankings:
              </Text>
              <Text fontSize="md" textAlign="right">
                {proposal.decoded.rankings.join(', ')}
              </Text>
            </Flex>
          </>
        )}

        {proposal.decoded?.propType === 'respectAccount' && (
          <>
            <Flex justifyContent="space-between">
              <Text fontSize="md" fontWeight="bold">
                Meeting Num:
              </Text>
              <Text fontSize="md" textAlign="right">
                {proposal.decoded.meetingNum}
              </Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text fontSize="md" fontWeight="bold">
                Group Num:
              </Text>
              <Text fontSize="md" textAlign="right">
                {proposal.decoded.groupNum}
              </Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text fontSize="md" fontWeight="bold">
                Value:
              </Text>
              <Text fontSize="md" textAlign="right">
                {proposal.decoded.value}
              </Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text fontSize="md" fontWeight="bold">
                Title:
              </Text>
              <Text fontSize="md" textAlign="right">
                {proposal.decoded.title}
              </Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text fontSize="md" fontWeight="bold">
                Reason:
              </Text>
              <Text fontSize="md" textAlign="right">
                {proposal.decoded.reason}
              </Text>
            </Flex>
          </>
        )}

        {proposal.decoded?.propType === 'burnRespect' && (
          <>
            <Flex justifyContent="space-between">
              <Text fontSize="md" fontWeight="bold">
                Token ID:
              </Text>
              <Text fontSize="md" textAlign="right">
                {proposal.decoded.tokenId}
              </Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text fontSize="md" fontWeight="bold">
                Reason:
              </Text>
              <Text fontSize="md" textAlign="right">
                {proposal.decoded.reason}
              </Text>
            </Flex>
          </>
        )}

        {proposal.decoded?.propType === 'tick' && (
          <>
            <Text fontSize="md">
              Data: {proposal.decoded.data}
            </Text>
            {proposal.decoded.link && (
              <Text fontSize="md">
                Link: {proposal.decoded.link}
              </Text>
            )}
          </>
        )}

        {proposal.decoded?.propType === 'customCall' && (
          <>
            <Text fontSize="md">
              Address: {proposal.addr}
            </Text>
            <Text fontSize="md">
              Cdata: {proposal.cdata}
            </Text>
          </>
        )}

        {proposal.decoded?.propType === 'customSignal' && (
          <>
            <Text fontSize="md">
              Data: {proposal.decoded.data}
            </Text>
            {proposal.decoded.link && (
              <Text fontSize="md">
                Link: {proposal.decoded.link}
              </Text>
            )}
          </>
        )}
      </Flex>

      <Flex gap={2} alignItems="center" mt={2}>
        <Text fontSize="md">
          Yes: {proposal.yesWeight}
        </Text>
        <Text fontSize="md">
          No: {proposal.noWeight}
        </Text>
      </Flex>
    </Card>
  );
}

function App() {
  return (
    <Flex direction="column" gap={4}>
      {proposals.map((prop) => (
        <ProposalCard key={prop.id} proposal={prop} />
      ))}
    </Flex>
  )
}

export default App
