import { FaRegHandRock } from "react-icons/fa";
import { TbContract } from 'react-icons/tb';
import { PiMedalFill, PiMedalThin } from "react-icons/pi";
import { GiConfirmed } from "react-icons/gi";
import SidebarWithHeader, { MenuItem } from "./app-frame/SidebarWithHeader";
import Fallback from "./Fallback";
import { FiHome } from "react-icons/fi";
import { useState } from "react";
import { FaRankingStar } from "react-icons/fa6";
// import Form from "./proposal/create/Form";
// import { CustomCallRequest, zCustomCallRequest } from "@ordao/ortypes/orclient.js";

export default function App() {


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