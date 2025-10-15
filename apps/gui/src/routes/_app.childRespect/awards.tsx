import { createFileRoute, useNavigate, useRouterState } from '@tanstack/react-router'
import { Flex } from '@chakra-ui/react'
import { Button } from '../../components/Button'
import { downloadText } from '../../utils/download'
import { zodValidator } from '@tanstack/zod-adapter'
import { assertOrclientBeforeLoad } from '../../global/routerContext'
import { zAwardsSearchParams } from '../../global/awardListSearchParams'
import { config } from '../../global/config'
import { PagedAwardsList } from '../../components/respect-view/PagedAwardsList'
import { zodObjectFields } from '@ordao/zod-utils'
import { zRespectAwardProps } from '@ordao/ortypes/respect1155.js'
import Papa from 'papaparse'

export const Route = createFileRoute('/_app/childRespect/awards')({
  component: AwardsRoute,
  validateSearch: zodValidator(zAwardsSearchParams),
  loaderDeps: ({ search }) => search,
  beforeLoad: assertOrclientBeforeLoad,
  loader: async ({ context: { orclient }, deps }) => {
    const limit = deps.limit === undefined ? config.defaultAwardsQuerySize : deps.limit;
    const spec = { ...deps, limit };
    const awards = await orclient.getAwards(spec);
    const awardsLeft = awards.length >= limit;
    const awardsSkipped = 'skip' in spec && spec.skip ? spec.skip : 0;
    return { awards, spec, awardsLeft, awardsSkipped };
  }
});

function AwardsRoute() {
  const { awards, awardsLeft, awardsSkipped, spec } = Route.useLoaderData();
  const { isLoading } = useRouterState();
  const navigate = useNavigate();

  const forwardEnabled = awardsLeft;
  const backEnabled = !!awardsSkipped;

  const onForward = () => {
    const skip = awardsSkipped + config.defaultAwardsQuerySize;
    navigate({ to: '/childRespect/awards', search: { skip, limit: config.defaultAwardsQuerySize } });
  };

  const onBack = () => {
    const minSkip = awardsSkipped - config.defaultAwardsQuerySize;
    const skip = minSkip <= 0 ? undefined : minSkip;
    navigate({ to: '/childRespect/awards', search: { skip, limit: config.defaultAwardsQuerySize } });
  };

  const onRefresh = () => {
    navigate({ to: '/childRespect/awards', search: spec });
  };

  const onExportCsv = () => {
    const fields = zodObjectFields(zRespectAwardProps);
    const headers = Object.keys(fields);
    headers.splice(headers.indexOf('periodNumber') + 1, 0, 'meetingNumber');

    const csv = Papa.unparse({
      fields: headers,
      data: awards.map(a => { return {...a.properties, meetingNumber: a.properties.periodNumber + 1 }})
    });
    downloadText("awards.csv", csv, "text/csv;charset=utf-8");
  }

  return (
    <>
      <Flex alignItems="center" justifyContent="flex-end" w="100%" gap={3}>
        <Button size="sm" onClick={onExportCsv}>Export as CSV</Button>
        <Button mr="1em" size="sm" onClick={() => window.open(config.childRespectLink, "_blank")}>Open in block explorer</Button>
      </Flex>
      <PagedAwardsList
        awards={awards.map(a => a.properties)}
        forwardEnabled={forwardEnabled}
        backEnabled={backEnabled}
        onBack={onBack}
        onForward={onForward}
        onRefresh={onRefresh}
        isLoading={isLoading}
      />
    </>
  );
}
