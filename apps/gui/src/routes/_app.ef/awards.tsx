import { createFileRoute } from '@tanstack/react-router'
import { assertOrclientBeforeLoad } from '../../global/routerContext'
import { Link, Table, VStack } from '@chakra-ui/react';
import { isValidHttpUrl } from '../../utils/isUrl';
import { config } from '../../global/config';

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

  return (
    <VStack gap="1em" alignItems={"flex-end"}>
      <Link href={config.childRespectLink} target="_blank">Block Explorer</Link>  
      <Table.Root variant="outline">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader fontWeight="bold">Title</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight="bold">Reason</Table.ColumnHeader>
            <Table.ColumnHeader fontWeight="bold">Denomination</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {awards.map(award => (
            <Table.Row key={award.properties.tokenId}>
              <Table.Cell>{award.properties.title}</Table.Cell>
              <Table.Cell wordBreak="break-word">{
                isValidHttpUrl(award.properties.reason ?? "")
                ? <a target="_blank" href={award.properties.reason}>{award.properties.reason}</a>
                : award.properties.reason
              }</Table.Cell>
              <Table.Cell>{award.properties.denomination}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

    </VStack>
  )
}
