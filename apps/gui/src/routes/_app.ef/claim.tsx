import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/ef/claim')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/eden/claim"!</div>
}
