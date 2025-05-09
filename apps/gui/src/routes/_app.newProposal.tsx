import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/newProposal')({
  component: RouteComponent,
})

function RouteComponent() {
  return <><Outlet/></>
}
