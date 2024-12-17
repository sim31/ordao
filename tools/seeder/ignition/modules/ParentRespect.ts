import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { zOldRespectSetup } from "@ordao/seeder/config";
import { zBigNumberish, zBigNumberishToBigint } from "@ordao/ortypes";
import { MintRequest, MintRespectGroupArgs, packTokenId, zInitialMintType } from "@ordao/ortypes/respect1155.js";

export default buildModule("ParentRespect", (m) => {
  const parentRespect = m.contract(
    "Respect1155",
    [
      m.getAccount(0),  // owner
      m.getParameter("uri"),
      m.getParameter("contractURI")
    ]
  )

  const mintReqs = m.getParameter("mintRequests");
  const data = m.getParameter("data", "0x");
  m.call(parentRespect, "mintRespectGroup", [mintReqs, data]);

  return { parentRespect };
});