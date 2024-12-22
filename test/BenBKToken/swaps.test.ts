import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { deployWithUniswapFixture } from "../helpers/fixtures";
import { addLiquidity } from "../helpers/liquidity";
import { LiquidityAmount } from "../helpers/types";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("BenBKToken Swaps", function () {
  async function setupLiquidityFixture() {
    const context = await deployWithUniswapFixture();
    const amount: LiquidityAmount = {
      tokens: hre.ethers.parseEther('1000'),
      eth: hre.ethers.parseEther('10')
    };
    await addLiquidity(context, amount);
    return context;
  }

  describe("ETH to Token Swaps", function () {
    it("Should swap ETH for tokens correctly", async function () {
      const context = await loadFixture(setupLiquidityFixture);
      const { benBKToken, uniswapRouter, owner, wethAddress } = context;

      const swapAmount = hre.ethers.parseEther('1');
      const balanceBefore = await benBKToken.balanceOf(owner.address);

      await uniswapRouter.swapExactETHForTokens(
        0,
        [wethAddress, benBKToken.target],
        owner.address,
        (await time.latest()) + 1000,
        { value: swapAmount }
      );

      const balanceAfter = await benBKToken.balanceOf(owner.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });
  });

  describe("Token to ETH Swaps", function () {
    it("Should swap tokens for ETH correctly", async function () {
      const context = await loadFixture(setupLiquidityFixture);
      const { benBKToken, uniswapRouter, owner, wethAddress } = context;

      const swapAmount = hre.ethers.parseEther('100');
      await benBKToken.approve(uniswapRouter.target, swapAmount);

      const balanceBefore = await hre.ethers.provider.getBalance(owner.address);

      await uniswapRouter.swapExactTokensForETH(
        swapAmount,
        0,
        [benBKToken.target, wethAddress],
        owner.address,
        (await time.latest()) + 1000
      );

      const balanceAfter = await hre.ethers.provider.getBalance(owner.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });
  });
});
