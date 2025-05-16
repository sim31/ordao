import { Box, Container, Tabs } from '@chakra-ui/react'
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/_app/about')({
  component: RouteComponent,
})

const aboutSubpaths = ['intent', 'appState', 'userGuide', 'communities'] as const;
export type AboutSubpath = typeof aboutSubpaths[number];
const titles: Record<AboutSubpath, string> = {
  "appState": "App State",
  "communities": "Communities",
  "intent": "Intent",
  "userGuide": "User Guide",
}


function RouteComponent() {
  const [tab, setTab] = useState<AboutSubpath>('intent');

  const navigate = useNavigate();
  
  const renderTabList = () => {
    return aboutSubpaths.map((subpath) => {
      return (
        <Tabs.Trigger key={subpath} value={subpath}>{titles[subpath]}</Tabs.Trigger>
      )
    })
  }

  const onTabSelect = (e: { value: string }) => {
    if (!aboutSubpaths.includes(e.value as AboutSubpath)) {
      throw new Error("Tabs component tried to navigate to non-existing path");
    }
    const tabVal = e.value as AboutSubpath;
    setTab(tabVal);
  }

  useEffect(() => {
    console.log("Navigating to ", tab);
    navigate({ from: '/about', to: `${tab}` });
  }, [tab, navigate])

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
