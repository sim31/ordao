import { createFileRoute } from '@tanstack/react-router'
import { assertOrclientBeforeLoad } from '../../global/routerContext'
import { Flex } from '@chakra-ui/react'
import { Button } from '../../components/Button'
import { downloadText } from '../../utils/download'
import { Text } from "../../components/Text";
import { AccountsTable } from '../../components/respect-view/AccountsTable'
import { config } from '../../global/config'
import Papa from 'papaparse'

export const Route = createFileRoute('/_app/childRespect/accounts')({
  component: AccountsRoute,
  beforeLoad: assertOrclientBeforeLoad,
  loader: async ({ context: { orclient } }) => {
    // Page through awards to build account totals from ornode
    const pageSize = 100;
    let skip = 0;
    let awardsLeft = true;
    const totals = new Map<string, number>();
    let sumActiveAwards = 0n;

    while (awardsLeft) {
      const batch = await orclient.getAwards({ skip, limit: pageSize });
      for (const a of batch) {
        const p = a.properties;
        // Only active (non-burned) awards are returned by default
        const val = BigInt(p.denomination);
        sumActiveAwards += val;
        const cur = totals.get(p.recipient) ?? 0;
        totals.set(p.recipient, cur + Number(p.denomination));
      }
      awardsLeft = batch.length >= pageSize;
      skip += pageSize;
    }

    const totalOnchain = await orclient.context.newRespect.totalRespect();

    let mismatchWarning: string | undefined;
    if (totalOnchain !== sumActiveAwards) {
      mismatchWarning = `Mismatch between on-chain totalRespect (${totalOnchain}) and ORNode active awards sum (${sumActiveAwards}).`;
      console.warn(mismatchWarning);
    }

    const total = Number(sumActiveAwards);
    const rows = Array.from(totals.entries())
      .map(([account, value]) => ({ account, value, pct: total > 0 ? (value / total) * 100 : 0 }))
      .sort((a, b) => b.value - a.value);

    return { rows, total, mismatchWarning };
  }
});

function AccountsRoute() {
  const { rows, total, mismatchWarning } = Route.useLoaderData();

  const onExportCsv = () => {
    const headers = ['account','value','pct'];
    const csv = Papa.unparse({
      fields: headers,
      data: rows
    });
    downloadText('accounts-respect.csv', csv, 'text/csv;charset=utf-8');
  }

  return (
    <>
      {mismatchWarning && (
        <Text color="orange.500" fontWeight="bold" mb={2} ml="1em">
          Warning: {mismatchWarning}
        </Text>
      )}
      <Flex alignItems="center" justifyContent="flex-end" w="100%" mb={2} gap={3}>
        <Text ml="1em" mr="1em">Total Respect: {total}</Text>
        <Button size="sm" onClick={onExportCsv}>Export as CSV</Button>
        <Button
          size="sm"
          onClick={() => window.open(config.childRespectLink, "_blank")}
          mr="1em"
        >
          Open in block explorer
        </Button>
      </Flex>
      <AccountsTable rows={rows} />
    </>
  );
}
