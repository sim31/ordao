import { Box, Container, Tabs } from '@chakra-ui/react'
import { createFileRoute, Outlet, useChildMatches, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react';

export const Route = createFileRoute('/_app/childRespect')({
  component: RouteComponent,
})

const subpaths = ['accounts', 'awards'] as const;
export type ChildRespectSubpath = typeof subpaths[number];
const titles: Record<ChildRespectSubpath, string> = {
  accounts: 'Accounts',
  awards: 'Awards',
};

function RouteComponent() {
  const matches = useChildMatches();
  const navigate = useNavigate();

  const match = useMemo(() => {
    for (const m of matches) {
      const childPath = m.routeId.split('/').pop();
      if (subpaths.includes(childPath as ChildRespectSubpath)) {
        return childPath as ChildRespectSubpath;
      }
    }
    return undefined;
  }, [matches]);

  const [tab, setTab] = useState<ChildRespectSubpath>('accounts');

  useEffect(() => {
    if (match) {
      setTab(match);
    } else {
      navigate({ from: '/childRespect', to: 'accounts' });
    }
  }, [match, navigate]);

  const renderTabList = () => {
    return subpaths.map((subpath) => (
      <Tabs.Trigger backgroundColor="gray.100" key={subpath} value={subpath}>{titles[subpath]}</Tabs.Trigger>
    ));
  }

  const onTabSelect = (e: { value: string }) => {
    if (!subpaths.includes(e.value as ChildRespectSubpath)) {
      throw new Error('Tabs component tried to navigate to non-existing path');
    }
    const tabVal = e.value as ChildRespectSubpath;
    navigate({ from: '/childRespect', to: tabVal });
  }

  return (
    <Container fluid padding="0" minHeight="100vh" backgroundColor="white">
      <Tabs.Root value={tab} size="lg" fitted onValueChange={onTabSelect}>
        <Tabs.List backgroundColor={'white'} flexWrap={'wrap'}>
          {renderTabList()}
        </Tabs.List>

        <Box mt="2em" ml="2em">
          <Outlet/>
        </Box>
      </Tabs.Root>
    </Container>
  )
}
