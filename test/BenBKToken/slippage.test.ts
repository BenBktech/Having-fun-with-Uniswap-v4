import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { deployWithUniswapFixture } from "../helpers/fixtures";
import { addLiquidity } from "../helpers/liquidity";
import { LiquidityAmount } from "../helpers/types";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("BenBKToken Slippage", function () {
  describe("Low Liquidity Scenarios", function () {
    it("Should handle high slippage in low liquidity pool", async function () {
      const context = await loadFixture(deployWithUniswapFixture);
      const { benBKToken, uniswapRouter, owner, wethAddress } = context;

      // Setup low liquidity
      const lowLiquidity: LiquidityAmount = {
        tokens: hre.ethers.parseEther('1000'),
        eth: hre.ethers.parseEther('0.1')
      };
      await addLiquidity(context, lowLiquidity);

      // Large swap relative to pool size
      const swapAmount = hre.ethers.parseEther('0.05');
      const amountsOut = await uniswapRouter.getAmountsOut(
        swapAmount,
        [wethAddress, benBKToken.target]
      );

      const minOutput = (amountsOut[1] * 90n) / 100n; // 10% slippage tolerance
      const balanceBefore = await benBKToken.balanceOf(owner.address);

      await uniswapRouter.swapExactETHForTokens(
        minOutput,
        [wethAddress, benBKToken.target],
        owner.address,
        (await time.latest()) + 1000,
        { value: swapAmount }
      );

      const balanceAfter = await benBKToken.balanceOf(owner.address);
      expect(balanceAfter - balanceBefore).to.be.gte(minOutput);
    });
  });

  describe("Slippage Protection", function () {
    it("Should revert when slippage tolerance is exceeded", async function () {
      const context = await loadFixture(deployWithUniswapFixture);
      const { benBKToken, uniswapRouter, owner, wethAddress } = context;

      const liquidity: LiquidityAmount = {
        tokens: hre.ethers.parseEther('1000'),
        eth: hre.ethers.parseEther('1')
      };
      await addLiquidity(context, liquidity);

      const swapAmount = hre.ethers.parseEther('0.1');
      const amountsOut = await uniswapRouter.getAmountsOut(
        swapAmount,
        [wethAddress, benBKToken.target]
      );

      const unrealisticMinOutput = (amountsOut[1] * 150n) / 100n; // 50% more than quoted

      await expect(
        uniswapRouter.swapExactETHForTokens(
          unrealisticMinOutput,
          [wethAddress, benBKToken.target],
          owner.address,
          (await time.latest()) + 1000,
          { value: swapAmount }
        )
      ).to.be.revertedWith("UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT");
    });
  });
});
