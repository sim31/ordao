import { createFileRoute } from '@tanstack/react-router'
import { APIClient } from "@wharfkit/antelope"
import { ContractKit } from "@wharfkit/contract"
import { Serializer } from '@wharfkit/antelope'
import { Table } from '@chakra-ui/react';

interface Account {
  name: string;
  balance: number;
}

const reStr = /^(\d+)\.0000 EDEN/;

export const Route = createFileRoute('/_app/ef/original')({
  component: RouteComponent,
  loader: async () => {
    const contractKit = new ContractKit({
      client: new APIClient({ url: "https://eos.greymass.com" }),
    })
    const contract = await contractKit.load("eden.fractal");
    const table = await contract.table("accounts");

    const scopesCursor = table.scopes();
    const allScopes = await scopesCursor.all()
    const accounts: Account[] = [];
    let total: number = 0;
    for (const scope of allScopes) {
      const table = await contract.table("accounts", scope.scope);
      const balance = await table.get();
      const name = Serializer.stringify(scope.scope).replace(/"/g, "");
      const balanceStr = Serializer.stringify(balance.balance).replace(/"/g, "");
      const reExec = reStr.exec(balanceStr);
      const value = reExec ? parseInt(reExec[1]) : 0;
      total += value;
      accounts.push({ name, balance: value });
    }

    const accountsSorted = accounts.sort((a, b) => b.balance - a.balance); 
    console.log("accountsSorted: ", accountsSorted);
    return { accounts: accountsSorted, total }
  }

})

function RouteComponent() {
  const { accounts, total } = Route.useLoaderData();

  return (
    <Table.Root variant="outline">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader fontWeight="bold">Account</Table.ColumnHeader>
          <Table.ColumnHeader fontWeight="bold">Balance</Table.ColumnHeader>
          <Table.ColumnHeader fontWeight="bold">%</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {accounts.map(account => (
          <Table.Row key={account.name}>
            <Table.Cell>{account.name}</Table.Cell>
            <Table.Cell>{account.balance}</Table.Cell>
            <Table.Cell>{((account.balance / total) * 100).toFixed(2)}%</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}
