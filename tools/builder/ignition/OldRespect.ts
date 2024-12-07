import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { zOldRespectSetup } from "@ordao/builder/config";
import { zBigNumberish, zBigNumberishToBigint } from "@ordao/ortypes";
import { MintRequest, MintRespectGroupArgs, packTokenId, zInitialMintType } from "@ordao/ortypes/respect1155.js";

export default buildModule("OldRespect", (m) => {
  const oldRespectSpec = m.getParameter("oldRespect");

  if (typeof oldRespectSpec === 'string') {
    // Will use existing Respect contract

    const oldRespect = m.contractAt("IRespect", oldRespectSpec);
    return { oldRespect };
  } else {
    // Will deploy and initialize new Respect contract

    const cfg = zOldRespectSetup.parse(oldRespectSpec);

    const oldRespect = m.contract(
      "Respect1155",
      [
        m.getAccount(0),  // owner
        cfg.uri,
        cfg.contractURI
      ]
    )

    const mintRequests: MintRequest[] = [];
    for (const holder of cfg.respectHolders) {
      const id = packTokenId({
        owner: holder.address,
        mintType: zInitialMintType.value,
        periodNumber: 0
      })
      mintRequests.push({ 
        value: zBigNumberish.parse(holder.amount), 
        id: zBigNumberishToBigint.parse(id)
      });
    }

    const args: MintRespectGroupArgs = {
      data: "0x",
      mintRequests
    };

    m.call(oldRespect, "mintRespectGroup", [mintRequests, "0x"]);

    if (cfg.setOwnerTo !== undefined) {
      m.call(oldRespect, "transferOwnership", [cfg.setOwnerTo]);
    }

    return { oldRespect };
  }
});