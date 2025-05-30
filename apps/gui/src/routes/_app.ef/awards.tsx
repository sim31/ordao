import { createFileRoute } from '@tanstack/react-router'
import { assertOrclientBeforeLoad } from '../../global/routerContext'
import { Link, Table, VStack } from '@chakra-ui/react';
import { isValidHttpUrl } from '../../utils/isUrl';
import { config } from '../../global/config';
import copy from 'copy-to-clipboard';
import { toaster } from '../../components/ui/toaster';
import { formatEthAddress } from 'eth-address';
import shortenUrl from "shorten-url";

export const Route = createFileRoute('/_app/ef/awards')({
  component: RouteComponent,
  beforeLoad: assertOrclientBeforeLoad,
  loader: async ({ context }) => {
    const awards = await context.orclient.getAwards({
      limit: 150
    });
    return { awards };
  }
})

function RouteComponent() {
  const { awards } = Route.useLoaderData();

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
            <Table.ColumnHeader fontWeight="bold">Title</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight="bold">Reason</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight="bold">Account</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight="bold">Denomination</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {awards.map(award => (
            <Table.Row key={award.properties.tokenId}>
              <Table.Cell>{award.properties.title}</Table.Cell>
              <Table.Cell wordBreak="break-word">{
                award.properties.reason && isValidHttpUrl(award.properties.reason ?? "")
                ? <Link
                    target="_blank"
                    href={award.properties.reason}
                  >
                    {shortenUrl(award.properties.reason, 40)}
                  </Link>
                : award.properties.reason ?? ""
              }
              </Table.Cell>
              <Table.Cell>
                <Link
                  onClick={() => handleCopy(award.properties.recipient)}
                >
                  {formatEthAddress(award.properties.recipient, 6)}
                </Link>
              </Table.Cell>
              <Table.Cell>{award.properties.denomination}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

    </VStack>
  )
}
