import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/ef/awards')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/eden/awards"!</div>
}
