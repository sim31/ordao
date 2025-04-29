import { FaRegHandRock } from "react-icons/fa";
import { TbContract } from 'react-icons/tb';
import { PiMedalFill, PiMedalThin } from "react-icons/pi";
import { GiConfirmed } from "react-icons/gi";
import SidebarWithHeader, { MenuItem } from "./app-frame/SidebarWithHeader";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import Fallback from "./Fallback";
import { FiHome } from "react-icons/fi";
import { useState } from "react";
import { FaRankingStar } from "react-icons/fa6";
// import Form from "./proposal/create/Form";
// import { CustomCallRequest, zCustomCallRequest } from "@ordao/ortypes/orclient.js";
import { ProposalList } from "./pages/ProposalList";
import { zBurnRespectRequest, zCustomCallRequest, zCustomSignalRequest, zRespectAccountRequest, zRespectBreakoutRequest, zTickRequest } from "@ordao/ortypes/orclient.js";
import { ProposalForm } from "./pages/ProposalForm";
import { stringify } from "@ordao/ts-utils";
import { ProposalView } from "./pages/ProposalView";
import { proposals } from "../global/testProps";
import ProposalFormMenu from "./pages/ProposalFormMenu";

const router = createBrowserRouter(
  createRoutesFromElements([
    <Route path="/" element={<ProposalList />} errorElement={<Fallback />}/>,
    <Route
      path="/customCall"
      element={
        <ProposalForm
          schema={zCustomCallRequest}
          onSubmit={(data) => {console.log("Submitted: ",stringify(data))}}
        />
      }
      errorElement={<Fallback />}
    />,
    <Route
      path="/burnRespect"
      element={
        <ProposalForm
          schema={zBurnRespectRequest}
          onSubmit={(data) => {console.log("Submitted: ",stringify(data))}}
        />
      }
      errorElement={<Fallback />}
    />,
    <Route
      path="/tick"
      element={
        <ProposalForm
          schema={zTickRequest}
          onSubmit={(data) => {console.log("Submitted: ",stringify(data))}}
        />
      }
      errorElement={<Fallback />}
    />,
    <Route
      path="/respectAccount"
      element={
        <ProposalForm
          schema={zRespectAccountRequest}
          onSubmit={(data) => {console.log("Submitted: ",stringify(data))}}
        />
      }
      errorElement={<Fallback />}
    />,
    <Route
      path="/customSignal"
      element={
        <ProposalForm
          schema={zCustomSignalRequest}
          onSubmit={(data) => {console.log("Submitted: ",stringify(data))}}
        />
      }
      errorElement={<Fallback />}
    />,
    <Route
      path="/respectBreakout"
      element={
        <ProposalForm
          schema={zRespectBreakoutRequest}
          onSubmit={(data) => {console.log("Submitted: ",stringify(data))}}
        />
      }
      errorElement={<Fallback />}
    />,
    <Route
      path="/propView"
      element={
        <ProposalView proposal={proposals[1]} />
      }
      errorElement={<Fallback />}
    />,
    <Route
      path="/newProposal"
      element={
        <ProposalFormMenu />
      }
      errorElement={<Fallback />}
    />,

  ])
);

const menuItems: Array<MenuItem> = [
  { id: "proposals", name: 'Proposals', icon: FiHome },
  { id: "submitBreakout", name: 'Submit Breakout Results', icon: FaRankingStar },
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