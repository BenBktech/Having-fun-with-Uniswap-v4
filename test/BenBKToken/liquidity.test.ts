import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { deployWithUniswapFixture } from "../helpers/fixtures";
import { addLiquidity, removeLiquidity } from "../helpers/liquidity";
import { LiquidityAmount } from "../helpers/types";

describe("BenBKToken Liquidity", function () {
  describe("Adding Liquidity", function () {
    it("Should add initial liquidity correctly", async function () {
      const context = await loadFixture(deployWithUniswapFixture);
      const { pairContract } = context;

      const amount: LiquidityAmount = {
        tokens: hre.ethers.parseEther('100'),
        eth: hre.ethers.parseEther('1')
      };

      await addLiquidity(context, amount);

      const [reserve0, reserve1] = await pairContract.getReserves();
      expect(reserve0).to.equal(amount.tokens);
      expect(reserve1).to.equal(amount.eth);
    });
  });

  describe("Removing Liquidity", function () {
    it("Should remove all liquidity correctly", async function () {
      const context = await loadFixture(deployWithUniswapFixture);
      const { pairContract } = context;

      const amount: LiquidityAmount = {
        tokens: hre.ethers.parseEther('100'),
        eth: hre.ethers.parseEther('1')
      };

      await addLiquidity(context, amount);
      const lpTokenBalance = await pairContract.balanceOf(context.owner.address);
      await removeLiquidity(context, lpTokenBalance);

      const [reserve0, reserve1] = await pairContract.getReserves();
      expect(reserve0).to.be.lessThan(amount.tokens / 1000n); // Less than 0.1%
      expect(reserve1).to.be.lessThan(amount.eth / 1000n);
    });
  });
});
