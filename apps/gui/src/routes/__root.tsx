import { createRootRoute,  Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import SidebarWithHeader, { MenuItem } from '../components/app-frame/SidebarWithHeader'
import { FiHome } from 'react-icons/fi'
import { FaRankingStar } from 'react-icons/fa6'
import { TbContract } from 'react-icons/tb'
import { PiMedalFill, PiMedalThin } from 'react-icons/pi'
// import { FaRegHandRock } from 'react-icons/fa'
// import { GiConfirmed } from 'react-icons/gi'
import { Container } from '@chakra-ui/react'
import { config } from '../global/config'

const menuItems: Array<MenuItem> = [
  { id: "/", name: 'Proposals', icon: FiHome },
  { id: "/newProposal", name: 'New Proposal', icon: TbContract },
  // TODO:
  { id: "submitBreakout", name: 'Submit Breakout Results', icon: FaRankingStar, externalLink: window.location.origin },
  { id: "parentRespect", name: 'Parent Respect', icon: PiMedalFill, externalLink: config.parentRespectLink },
  { id: "childRespect", name: 'Child Respect', icon: PiMedalThin, externalLink: config.childRespectLink },
  // TODO:
  // { id: "claim", name: 'Claim parent Respect', icon: FaRegHandRock },
  // { id: "confirm", name: 'Confirm parent Respect', icon: GiConfirmed },
]

export const Route = createRootRoute({
  component: () => {

    return (
      <Container minHeight="100vh" minWidth="100vw" padding="0px">
        <SidebarWithHeader
          menuItems={menuItems}
          selectedMenuItemId={"proposals"}
        >
          <Outlet />
        </SidebarWithHeader>
        <TanStackRouterDevtools />
      </Container>
    )
  },
})