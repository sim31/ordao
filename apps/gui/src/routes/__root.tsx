import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { RouterContext } from '../global/routerContext'
import { Container } from '@chakra-ui/react'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from '../components/ui/toaster'

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <Container fluid margin={0} padding={0}>
      <Outlet />
      <Toaster />
      <TanStackRouterDevtools />
    </Container>
  )
}
