import { createFileRoute } from '@tanstack/react-router'
import { assertOrclientBeforeLoad } from '../../global/routerContext'
import { EthAddress } from '@ordao/ortypes';
import { useMemo } from 'react';
import { Link, Table, VStack } from '@chakra-ui/react';
import { config } from '../../global/config';
import { formatEthAddress } from 'eth-address';
import copy from 'copy-to-clipboard';
import { toaster } from '../../components/ui/toaster';

export const Route = createFileRoute('/_app/ef/accounts')({
  component: RouteComponent,
  beforeLoad: assertOrclientBeforeLoad,
  loader: async ({ context }) => {
    const awards = await context.orclient.getAwards({
      limit: 150
    });

    const accounts: Record<EthAddress, number> = {};
    let total: number = 0;
    for (const award of awards) {
      total += award.properties.denomination;
      const addr = award.properties.recipient;
      accounts[addr] = (accounts[addr] ?? 0) + award.properties.denomination;
    }

    return { accounts, total };
  }
})

function RouteComponent() {
  const { accounts, total } = Route.useLoaderData();

  const accList = useMemo(() => {
    return Object.entries(accounts).sort((a, b) => b[1] - a[1]);
  }, [accounts])

  const handleCopy = (str: string) => {
    copy(str)
    toaster.create({
      description: 'Copied to clipboard',
      type: 'info'
    })
  }

  return (
    <VStack gap="1em" alignItems={"flex-end"}>
      <Link href={config.childRespectLink} target="_blank">Block Explorer</Link>  
      <Table.Root variant="outline">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader fontWeight="bold">Account</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight="bold">Balance</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight="bold">%</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {accList.map(account => (
            <Table.Row key={account[0]}>
              <Table.Cell wordBreak={"break-word"}>
                <Link
                  onClick={() => handleCopy(account[0])}
                >
                  {formatEthAddress(account[0], 8)}
                </Link>
              </Table.Cell>
              <Table.Cell>{account[1]}</Table.Cell>
              <Table.Cell>{((account[1] / total) * 100).toFixed(2)}%</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </VStack>
  )

}
