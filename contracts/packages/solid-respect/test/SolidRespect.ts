import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("SolidRespect", function () {
  async function deploy() {
    // Contracts are deployed using the first signer/account by default
    const signers = await hre.ethers.getSigners();

    const name = "TOKEN";
    const symbol = "TOK";

    const addresses = signers.map(signer => signer.address);
    const balances = signers.map(signer => Math.floor(Math.random() * 1000) + 1);

    const SolidRespectFactory = await hre.ethers.getContractFactory("SolidRespect");

    const contract = await SolidRespectFactory.deploy(name, symbol, addresses, balances);

    return { contract, addresses, balances };
  }

  describe("Deployment", function () {
    it("Should set the right balances", async function () {
      const { contract, addresses, balances } = await loadFixture(deploy);

      for (const [i, addr] of addresses.entries()) {
        const balance = await contract.balanceOf(addr);
        console.log("addr: ", addr, ", balance: ", balance);
        expect(balance).to.equal(balances[i]);
      }
    });

    it("Should set the right name", async function() {
      const { contract } = await loadFixture(deploy);

      expect(await contract.name()).to.equal("TOKEN");
    })

    it("Should set the right symbol", async function() {
      const { contract } = await loadFixture(deploy);

      expect(await contract.symbol()).to.equal("TOK");
    });

    it("Should set the right totalSupply", async function() {
      const { contract, balances } = await loadFixture(deploy);

      const expSupply = balances.reduce((prevVal, newVal) => prevVal + newVal, 0);

      expect(await contract.totalSupply()).to.equal(expSupply);
    })

    it("Should set the right decimals", async function() {
      const { contract } = await loadFixture(deploy);

      expect(await contract.decimals()).to.equal(0);
    })
  });

  describe("Transfers", function () {

    it("Should not allow transfer", async function() {
      const { contract, balances, addresses } = await loadFixture(deploy);

      const sender = addresses[0];
      const receiver = addresses[1];
      const amount = balances[0];

      await expect(contract.transfer(receiver, amount, { from: sender })).to.be.reverted;
    })

    it("Should not allow approve", async function() {
      const { contract, addresses } = await loadFixture(deploy);

      const owner = addresses[0];
      const spender = addresses[1];
      const amount = 100;

      await expect(contract.approve(spender, amount, { from: owner })).to.be.reverted;
    })

    it("Should not allow transferFrom", async function() {
      const { contract, addresses } = await loadFixture(deploy);

      const sender = addresses[0];
      const receiver = addresses[1];
      const amount = 100;

      await expect(contract.transferFrom(sender, receiver, amount, { from: sender })).to.be.reverted;
    })


  });

});
