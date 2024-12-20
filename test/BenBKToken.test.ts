import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { assert, expect } from "chai";
import hre from "hardhat";

describe("BenBKToken", function () {
  
  async function deployBenBKTokenFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, account2, account3] = await hre.ethers.getSigners();

    const uniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const uniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

    const oneEther = hre.ethers.parseEther('1');
  
    const BenBKToken = await hre.ethers.getContractFactory("BenBKToken");
    const benBKToken = await BenBKToken.deploy(owner.address, uniswapRouterAddress, uniswapFactoryAddress);

    return { benBKToken, owner, account2, account3 };
  }

  describe("Deployment", function () {
    it("Should deploy the smart contract with the right owner", async function () {
      const { benBKToken, owner, account2, account3 } = await loadFixture(deployBenBKTokenFixture);
      const contractOwner = await benBKToken.owner();
      assert(contractOwner === owner.address);
    });

    it('Should deploy the smart contract and mint the tokens to the owner', async function() {
      const { benBKToken, owner, account2, account3 } = await loadFixture(deployBenBKTokenFixture);
      const balanceOfBenBKToken = await benBKToken.balanceOf(owner.address);
      const expectedBenBKTokenBalanceOfOwner = hre.ethers.parseEther('1000000');
      assert(balanceOfBenBKToken === expectedBenBKTokenBalanceOfOwner);
    })

    it('Should get the UniswapV2 Pool Information', async function() {
      const { benBKToken, owner, account2, account3 } = await loadFixture(deployBenBKTokenFixture);

      // Définir l'adresse du routeur Uniswap
      const uniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // Adresse du routeur Uniswap sur Ethereum Mainnet
      const uniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"; // Adresse de la factory Uniswap

      // Obtenir le contrat du routeur Uniswap
      const uniswapRouter = await hre.ethers.getContractAt("IUniswapV2Router02", uniswapRouterAddress);
      const uniswapFactory = await hre.ethers.getContractAt("IUniswapV2Factory", uniswapFactoryAddress);

      // Obtenir l'adresse de WETH
      const wethAddress = await uniswapRouter.WETH();

      // Obtenir l'adresse de la paire
      const pairAddress = await uniswapFactory.getPair(benBKToken.target, wethAddress);
      const pairContract = await hre.ethers.getContractAt("IUniswapV2Pair", pairAddress);

      // Obtenir les réserves
      const [reserve0, reserve1,] = await pairContract.getReserves();
      const token0 = await pairContract.token0();
      const token1 = await pairContract.token1();

      // Vérifier que les tokens dans la paire sont corrects
      expect(token0).to.be.oneOf([benBKToken.target, wethAddress]);
      expect(token1).to.be.oneOf([benBKToken.target, wethAddress]);
    })
  });
});
