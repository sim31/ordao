import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/ef/balances')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/eden/totals"!</div>
}
