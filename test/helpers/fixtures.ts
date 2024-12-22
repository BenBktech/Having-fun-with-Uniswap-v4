import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { TestContext, LiquidityAmount } from "./types";

const UNISWAP_ADDRESSES = {
  ROUTER: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  FACTORY: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
};

export async function deployWithUniswapFixture(): Promise<TestContext> {
  const [owner, account2, account3] = await hre.ethers.getSigners();
  
  const BenBKToken = await hre.ethers.getContractFactory("BenBKToken");
  const benBKToken = await BenBKToken.deploy(
    owner.address, 
    UNISWAP_ADDRESSES.ROUTER, 
    UNISWAP_ADDRESSES.FACTORY
  );

  const uniswapRouter = await hre.ethers.getContractAt(
    "IUniswapV2Router02", 
    UNISWAP_ADDRESSES.ROUTER
  );
  const uniswapFactory = await hre.ethers.getContractAt(
    "IUniswapV2Factory", 
    UNISWAP_ADDRESSES.FACTORY
  );
  
  const wethAddress = await uniswapRouter.WETH();
  const pairAddress = await uniswapFactory.getPair(benBKToken.target, wethAddress);
  const pairContract = await hre.ethers.getContractAt("IUniswapV2Pair", pairAddress);

  return {
    benBKToken,
    owner,
    account2,
    account3,
    uniswapRouter,
    uniswapFactory,
    wethAddress,
    pairContract
  };
}
