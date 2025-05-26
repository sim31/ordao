import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/ef/confirm')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/eden/confirm"!</div>
}
