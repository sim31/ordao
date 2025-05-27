import { createFileRoute } from '@tanstack/react-router'
import "../../global/wharfSessionKit";

export const Route = createFileRoute('/_app/ef/claim')({
  component: RouteComponent,
  loader: async () => ({

  })
})

function RouteComponent() {
  return <div>Hello "/_app/eden/claim"!</div>
}
