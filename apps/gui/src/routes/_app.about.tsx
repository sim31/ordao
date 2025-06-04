import { Box, Container, Tabs } from '@chakra-ui/react'
import { createFileRoute, Outlet, useChildMatches, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react';

export const Route = createFileRoute('/_app/about')({
  component: RouteComponent,
})

const aboutSubpaths = ['intent', 'appState', 'userGuide'] as const;
export type AboutSubpath = typeof aboutSubpaths[number];
const titles: Record<AboutSubpath, string> = {
  "appState": "App State",
  "intent": "Intent",
  "userGuide": "User Guide",
}


function RouteComponent() {
  const matches = useChildMatches();
  const navigate = useNavigate();

  const match = useMemo(() => {
    for (const m of matches) {
      const childPath = m.routeId.split('/').pop();
      if (aboutSubpaths.includes(childPath as AboutSubpath)) {
        return childPath as AboutSubpath;
      }
    }
    return undefined;
  }, [matches]);

  console.log("Match: ", match);

  const [tab, setTab] = useState<AboutSubpath>('intent');

  useEffect(() => {
    if (match) {
      setTab(match);
    } else {
      navigate({ from: '/about', to: 'intent' });
    }
  }, [match, navigate]);

  
  const renderTabList = () => {
    return aboutSubpaths.map((subpath) => {
      return (
        <Tabs.Trigger backgroundColor="gray.100" key={subpath} value={subpath}>{titles[subpath]}</Tabs.Trigger>
      )
    })
  }

  const onTabSelect = (e: { value: string }) => {
    if (!aboutSubpaths.includes(e.value as AboutSubpath)) {
      throw new Error("Tabs component tried to navigate to non-existing path");
    }
    const tabVal = e.value as AboutSubpath;
    navigate({ from: '/about', to: tabVal });
  }

  return (
    <Container fluid padding="0" minHeight="100vh" backgroundColor="white">
      <Tabs.Root value={tab} size="lg" fitted onValueChange={onTabSelect}>
        <Tabs.List backgroundColor={"white"} flexWrap={"wrap"}>
          {renderTabList()}
        </Tabs.List>

        <Box mt="2em" ml="2em">
          <Outlet/>
        </Box>

      </Tabs.Root>
    </Container>
    
  )
}
