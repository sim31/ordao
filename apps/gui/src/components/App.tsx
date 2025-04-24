import { FaRegHandRock } from "react-icons/fa";
import { TbContract } from 'react-icons/tb';
import { PiMedalFill, PiMedalThin } from "react-icons/pi";
import { GiConfirmed } from "react-icons/gi";
import SidebarWithHeader, { MenuItem } from "./app-frame/SidebarWithHeader";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { ProposalList } from "./proposal/ProposalList";
import Fallback from "./Fallback";
import { FiHome } from "react-icons/fi";
import { useState } from "react";
import { ArrowDownWideNarrow } from "lucide-react"

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<ProposalList />} errorElement={<Fallback />}/>
  )
);

const menuItems: Array<MenuItem> = [
  { id: "proposals", name: 'Proposals', icon: FiHome },
  { id: "submitBreakout", name: 'Submit Breakout Results', icon: ArrowDownWideNarrow },
  { id: "new", name: 'New Proposal', icon: TbContract },
  { id: "parentRespect", name: 'Parent Respect', icon: PiMedalFill },
  { id: "childRespect", name: 'Child Respect', icon: PiMedalThin },
  { id: "claim", name: 'Claim parent Respect', icon: FaRegHandRock },
  { id: "confirm", name: 'Confirm parent Respect', icon: GiConfirmed },
]

export default function App() {

  const [menuItem, setMenuItem] = useState<string>('proposals'); 

  const onMenuSelect = (id: string) => {
    console.log("Menu item selected: ", id);
    setMenuItem(id);
  }

  return (
    <SidebarWithHeader
      menuItems={menuItems}
      onMenuSelect={onMenuSelect}
      selectedMenuItemId={menuItem}
    >
      <RouterProvider router={router} />
    </SidebarWithHeader>
  );
}