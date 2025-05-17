import { FiHome } from "react-icons/fi";
import { TbContract } from "react-icons/tb";
import { FaRankingStar } from "react-icons/fa6";
import { PiMedalFill, PiMedalThin } from "react-icons/pi";
import { config } from "./config";
import { RouteIds } from "@tanstack/react-router";
import { routeTree } from "../routeTree.gen";
import { IconType } from "react-icons";
import { MdGroups } from "react-icons/md";
import { MdOutlineInfo } from "react-icons/md";


export interface MenuItemBase {
  id: string
  name: string
  icon: IconType
}

export interface MenuItemExternalLink extends MenuItemBase {
  externalLink: string
}

export interface MenuItemInternalLink extends MenuItemBase {
  id: RouteIds<typeof routeTree>
}

export type MenuItem = MenuItemExternalLink | MenuItemInternalLink;


export const menuItems: Array<MenuItem> = [
  { id: "/_app/proposals", name: 'Proposals', icon: FiHome },
  { id: "/_app/newProposal", name: 'New Proposal', icon: TbContract },
  { id: "playRespectGame", name: 'Play Respect Game', icon: MdGroups, externalLink: config.respectGameLink },
  { id: "/_app/submitBreakout", name: 'Submit Breakout Results', icon: FaRankingStar },
  { id: "parentRespect", name: 'Parent Respect', icon: PiMedalFill, externalLink: config.parentRespectLink },
  { id: "childRespect", name: 'Child Respect', icon: PiMedalThin, externalLink: config.childRespectLink },
  { id: "/_app/about", name: 'About', icon: MdOutlineInfo },


  // TODO:
  // { id: "claim", name: 'Claim parent Respect', icon: FaRegHandRock },
  // { id: "confirm", name: 'Confirm parent Respect', icon: GiConfirmed },
]

export function isExternalLink(item: MenuItem): item is MenuItemExternalLink {
  return 'externalLink' in item;
}