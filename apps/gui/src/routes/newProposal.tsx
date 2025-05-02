import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/newProposal')({
  component: RouteComponent,
})

function RouteComponent() {
  return <><Outlet/></>
}
