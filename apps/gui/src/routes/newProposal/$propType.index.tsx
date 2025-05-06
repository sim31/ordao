import { createFileRoute, notFound } from '@tanstack/react-router'
import { ProposalZodCard } from '../../components/form/ProposalZodCard'
import { propRequestSchemaMap } from '@ordao/ortypes/orclient.js'
import { zPropType } from '@ordao/ortypes';
import { sleep } from '@ordao/ts-utils';
import { isORClient, ORClient } from '@ordao/orclient';
import { useMemo } from 'react';
import { Button, Center } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';

export const Route = createFileRoute('/newProposal/$propType/')({
  component: RouteComponent,
  loader: async ({ context, params: { propType } }) => {
    await context.appContext.waitForPrivyReady();
    await sleep(1000)
    const orclient = await context.appContext.getOrclient();
    const parsedPropType = zPropType.safeParse(propType);
    if (parsedPropType.success) {
      return { propType: parsedPropType.data, orclient }
    } else {
      throw notFound();
    }
  }
})

function RouteComponent() {
  const { propType, orclient } = Route.useLoaderData();

  // TODO: duplicate with submitBreakout
  const { login: privyLogin } = usePrivy();

  const fullOrclient: ORClient | undefined = useMemo(() => {
    if (!isORClient(orclient)) {
      return undefined;
    } else {
      return orclient;
    }
  }, [orclient])


  const navigate = Route.useNavigate();

  if (!fullOrclient) {
    return (
      <Center>
        <Button size="xl" color="black" variant="outline" onClick={privyLogin}>Login</Button>
      </Center>
    );
  } else {

    return (
      <ProposalZodCard
        schema={propRequestSchemaMap[propType]}
        propType={propType}
        onComplete={() => navigate({ to: "/" })}
        onCancel={() => navigate({ to: '/newProposal' })}
        orclient={fullOrclient}      />
    )
    // return (
    //   <SubmitBreakoutCard
    //     orclient={fullOrclient}
    //     onComplete={goBack}
    //     onCancel={goBack}
    //     searchParams={searchParams}
    //     setSearchParams={(params) => navigate({ search: params })}
    //   />
    // );
  }
}

