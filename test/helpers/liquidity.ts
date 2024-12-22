import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { TestContext, LiquidityAmount } from "./types";

export async function addLiquidity(
  context: TestContext,
  amount: LiquidityAmount
): Promise<void> {
  const { benBKToken, uniswapRouter, owner } = context;

  await benBKToken.approve(uniswapRouter.target, amount.tokens);
  
  await uniswapRouter.addLiquidityETH(
    benBKToken.target,
    amount.tokens,
    0,
    0,
    owner.address,
    (await time.latest()) + 1000,
    { value: amount.eth }
  );
}

export async function removeLiquidity(
  context: TestContext,
  lpTokenAmount: bigint
): Promise<void> {
  const { benBKToken, uniswapRouter, owner, pairContract } = context;

  await pairContract.approve(uniswapRouter.target, lpTokenAmount);
  
  await uniswapRouter.removeLiquidityETH(
    benBKToken.target,
    lpTokenAmount,
    0,
    0,
    owner.address,
    (await time.latest()) + 1000
  );
}
