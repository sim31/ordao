import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/proposals')({
  component: RouteComponent,
})

function RouteComponent() {
  return <><Outlet/></>
}
