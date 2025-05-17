import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Navigate to="/proposals" />
}
