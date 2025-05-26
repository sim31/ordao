import { Box, Container, Tabs } from '@chakra-ui/react'
import { createFileRoute, Outlet, useChildMatches, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react';


export const Route = createFileRoute('/_app/ef')({
  component: RouteComponent,
})

const efSubpaths = ['claim', 'original', 'awards', 'balances', 'confirm'] as const;
export type EfSubpath = typeof efSubpaths[number];
const titles: Record<EfSubpath, string> = {
  "claim": "Claim",
  "original": "Original Token",
  "awards": "Awards",
  "balances": "Balances",
  "confirm": "Confirm claim"
}


function RouteComponent() {
  const matches = useChildMatches();
  const navigate = useNavigate();

  const match = useMemo(() => {
    for (const m of matches) {
      const childPath = m.routeId.split('/').pop();
      if (efSubpaths.includes(childPath as EfSubpath)) {
        return childPath as EfSubpath;
      }
    }
    return undefined;
  }, [matches]);

  console.log("Match: ", match);

  const [tab, setTab] = useState<EfSubpath>('claim');

  useEffect(() => {
    if (match) {
      setTab(match);
    } else {
      navigate({ from: '/ef', to: 'claim' });
    }
  }, [match, navigate]);

  
  const renderTabList = () => {
    return efSubpaths.map((subpath) => {
      return (
        <Tabs.Trigger backgroundColor="gray.100" key={subpath} value={subpath}>{titles[subpath]}</Tabs.Trigger>
      )
    })
  }

  const onTabSelect = (e: { value: string }) => {
    if (!efSubpaths.includes(e.value as EfSubpath)) {
      throw new Error("Tabs component tried to navigate to non-existing path");
    }
    const tabVal = e.value as EfSubpath;
    navigate({ from: '/ef', to: tabVal });
  }

  return (
    <Container fluid padding="0" minHeight="100vh" backgroundColor="white" paddingBottom="4em">
      <Tabs.Root value={tab} size="lg" fitted onValueChange={onTabSelect}>
        <Tabs.List backgroundColor={"white"} flexWrap={"wrap"}>
          {renderTabList()}
        </Tabs.List>

        <Box mt="2em" ml="2em" mr="2em">
          <Outlet/>
        </Box>

      </Tabs.Root>
    </Container>
    
  )
}

