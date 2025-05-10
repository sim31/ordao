import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/submitBreakout')({
  component: RouteComponent,
})

function RouteComponent() {
  return <><Outlet/></>
}
