import { createFileRoute, useRouteContext } from '@tanstack/react-router'

export const Route = createFileRoute('/_app')({
  component: RouteComponent,
})

function RouteComponent() {
  const { orclient } = useRouteContext();

  return (
    <Container minHeight="100vh" minWidth="100vw" padding="0px">
      <SidebarWithHeader
        accountInfo={accountInfo}
        onLogin={login}
        onLogout={privyLogout}
        menuItems={menuItems}
      >
        <Flex direction="column" gap={4}>
          <OrclientLoader>
            {/* // This is rendered only when orclient is defined */}
            <Outlet />
          </OrclientLoader>
        </Flex>
      </SidebarWithHeader>
      <Toaster />
      <TanStackRouterDevtools />
    </Container>
  );
}
