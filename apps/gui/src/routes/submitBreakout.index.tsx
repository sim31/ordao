import { createFileRoute } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { SubmitBreakoutCard } from '../components/form/SubmitBreakoutCard';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useMemo } from 'react';
import { isORClient, ORClient } from '@ordao/orclient';
import { Button, VStack } from '@chakra-ui/react';
import { zSearchParams } from '../global/searchParams';

export const Route = createFileRoute('/submitBreakout/')({
  component: RouteComponent,
  validateSearch: zodValidator(zSearchParams)
})

function RouteComponent() {
  const { orclientServer } = Route.useRouteContext();

  const { login: privyLogin } = usePrivy();

  const orclient = orclientServer.getOrclientSync();
  const fullOrclient: ORClient | undefined = useMemo(() => {
    if (!isORClient(orclient)) {
      return undefined;
    } else {
      return orclient;
    }
  }, [orclient])

  useEffect(() => {
    if (!fullOrclient) {
      privyLogin();
    }
  }, [fullOrclient, privyLogin])


  const navigate = Route.useNavigate();
  const goBack = () => {
    navigate({ to: '/' })
  }

  const searchParams = Route.useSearch();

  if (!fullOrclient) {
    return (
      <VStack>
        <Button color="black" onClick={privyLogin}>Login</Button>
      </VStack>
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
