import { createFileRoute } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { SubmitBreakoutCard } from '../components/form/SubmitBreakoutCard';
import { usePrivy } from '@privy-io/react-auth';
import { useMemo } from 'react';
import { isORClient, ORClient } from '@ordao/orclient';
import { Button, Center } from '@chakra-ui/react';
import { zSearchParams } from '../global/searchParams';
import { sleep } from '@ordao/ts-utils';

export const Route = createFileRoute('/submitBreakout/')({
  component: RouteComponent,
  loader: async ({ context: { appContext } }) => {
    await appContext.waitForPrivyReady();
    // Privy often says it's ready early too often
    await sleep(1000);
    const orclient = await appContext.getOrclient();
    return { orclient }
  },
  validateSearch: zodValidator(zSearchParams)
})

function RouteComponent() {
  const { orclient } = Route.useLoaderData();

  const { login: privyLogin } = usePrivy();

  const fullOrclient: ORClient | undefined = useMemo(() => {
    if (!isORClient(orclient)) {
      return undefined;
    } else {
      return orclient;
    }
  }, [orclient])


  const navigate = Route.useNavigate();
  const goBack = () => {
    navigate({ to: '/' })
  }

  const searchParams = Route.useSearch();

  if (!fullOrclient) {
    return (
      <Center>
        <Button size="xl" color="black" variant="outline" onClick={privyLogin}>Login</Button>
      </Center>
    );
  } else {
    return (
      <SubmitBreakoutCard
        orclient={fullOrclient}
        onComplete={goBack}
        onCancel={goBack}
        searchParams={searchParams}
        setSearchParams={(params) => navigate({ search: params })}
      />
    );
  }
}
