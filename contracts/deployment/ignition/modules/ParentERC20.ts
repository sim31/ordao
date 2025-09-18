import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import hre from "hardhat";

// This is for dev environment, so parameters are hardcoded

export default buildModule("ParentERC20", (m) => {
  const parentRespect = m.contract(
    "MintableToken",
    [
      m.getAccount(0), // owner
      "ERC20Respect", // name
      "ER",             // symbol
    ]
  )

  m.call(parentRespect, "mint", [m.getAccount(16), 100n*10n**18n], { id: "mint1" })
  m.call(parentRespect, "mint", [m.getAccount(15), 20n*10n**18n], { id: "mint2" })
  m.call(parentRespect, "mint", [m.getAccount(14), 30n*10n**18n], { id: "mint3" })
  m.call(parentRespect, "mint", [m.getAccount(13), 40n*10n**18n], { id: "mint4" })

  return { parentRespect };
});