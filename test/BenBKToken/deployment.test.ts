import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { deployWithUniswapFixture } from "../helpers/fixtures";

describe("BenBKToken Deployment", function () {
  it("Should deploy with the correct owner", async function () {
    const { benBKToken, owner } = await loadFixture(deployWithUniswapFixture);
    expect(await benBKToken.owner()).to.equal(owner.address);
  });

  it("Should mint initial supply to owner", async function () {
    const { benBKToken, owner } = await loadFixture(deployWithUniswapFixture);
    const expectedBalance = hre.ethers.parseEther('1000000');
    expect(await benBKToken.balanceOf(owner.address)).to.equal(expectedBalance);
  });

  it("Should setup Uniswap pair correctly", async function () {
    const { benBKToken, wethAddress, pairContract } = await loadFixture(deployWithUniswapFixture);
    
    const token0 = await pairContract.token0();
    const token1 = await pairContract.token1();
    
    expect(token0).to.be.oneOf([benBKToken.target, wethAddress]);
    expect(token1).to.be.oneOf([benBKToken.target, wethAddress]);
  });
});
