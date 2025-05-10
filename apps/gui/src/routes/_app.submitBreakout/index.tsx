import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { SubmitBreakoutCard } from '../../components/form/SubmitBreakoutCard';
import FullOrclientAsserter from '../../components/FullOrclientAsserter';
import { assertOrclientBeforeLoad } from '../../global/routerContext';
import { zSearchParams } from '../../global/submitBreakoutSearchParams';

export const Route = createFileRoute('/_app/submitBreakout/')({
  component: RouteComponent,
  beforeLoad: assertOrclientBeforeLoad,
  validateSearch: zodValidator(zSearchParams)
})

function RouteComponent() {
  const navigate = Route.useNavigate();
  const goBack = () => {
    navigate({ to: '/' })
  }

  const searchParams = Route.useSearch();

  const { orclient } = Route.useRouteContext();

  return (
    <FullOrclientAsserter orclient={orclient}>
      <SubmitBreakoutCard
        onComplete={goBack}
        onCancel={goBack}
        searchParams={searchParams}
        setSearchParams={(params) => navigate({ search: params })}
      />
    </FullOrclientAsserter>
  );
}
