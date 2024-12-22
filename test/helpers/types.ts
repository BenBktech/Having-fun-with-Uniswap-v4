import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { BenBKToken } from "../../typechain-types";

export interface TestContext {
  benBKToken: BenBKToken;
  owner: HardhatEthersSigner;
  account2: HardhatEthersSigner;
  account3: HardhatEthersSigner;
  uniswapRouter: any;
  uniswapFactory: any;
  wethAddress: string;
  pairContract: any;
}

export interface LiquidityAmount {
  tokens: bigint;
  eth: bigint;
}
