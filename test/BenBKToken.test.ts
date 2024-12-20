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

    // We fork the Ethereum Mainnet, we need to use the UniswapV2 Router and Factory addresses
    const uniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const uniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  
    // Deploy the BenBKToken contract
    const BenBKToken = await hre.ethers.getContractFactory("BenBKToken");
    const benBKToken = await BenBKToken.deploy(owner.address, uniswapRouterAddress, uniswapFactoryAddress);

    return { benBKToken, owner, account2, account3 };
  }

  describe("Deployment", function () {
    it("Should deploy the smart contract with the right owner", async function () {
      const { benBKToken, owner, account2, account3 } = await loadFixture(deployBenBKTokenFixture);
      // Check if the contract owner is the owner of the fixture
      const contractOwner = await benBKToken.owner();
      assert(contractOwner === owner.address);
    });

    it('Should deploy the smart contract and mint the tokens to the owner', async function() {
      const { benBKToken, owner, account2, account3 } = await loadFixture(deployBenBKTokenFixture);
      // Check if the owner has the right amount of tokens
      const balanceOfBenBKToken = await benBKToken.balanceOf(owner.address);
      const expectedBenBKTokenBalanceOfOwner = hre.ethers.parseEther('1000000');
      assert(balanceOfBenBKToken === expectedBenBKTokenBalanceOfOwner);
    })

    it('Should get the UniswapV2 Pool Information', async function() {
      const { benBKToken, owner, account2, account3 } = await loadFixture(deployBenBKTokenFixture);

      // We fork the Ethereum Mainnet, we need to use the UniswapV2 Router and Factory addresses
      const uniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
      const uniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

      // Get the UniswapV2 Router and Factory contracts
      const uniswapRouter = await hre.ethers.getContractAt("IUniswapV2Router02", uniswapRouterAddress);
      const uniswapFactory = await hre.ethers.getContractAt("IUniswapV2Factory", uniswapFactoryAddress);

      // Get the WETH address
      const wethAddress = await uniswapRouter.WETH();

      // Get the pair address and the pair contract
      const pairAddress = await uniswapFactory.getPair(benBKToken.target, wethAddress);
      const pairContract = await hre.ethers.getContractAt("IUniswapV2Pair", pairAddress);

      // Get the reserves and the tokens in the pair
      const [reserve0, reserve1,] = await pairContract.getReserves();
      const token0 = await pairContract.token0();
      const token1 = await pairContract.token1();

      // Check if the tokens in the pair are correct
      expect(token0).to.be.oneOf([benBKToken.target, wethAddress]);
      expect(token1).to.be.oneOf([benBKToken.target, wethAddress]);
    })
  });

  describe("Add Liquidity", function() {
    it('Should add liquidity to the UniswapV2 Pool', async function() {
      const { benBKToken, owner, account2, account3 } = await loadFixture(deployBenBKTokenFixture);

      // We fork the Ethereum Mainnet, we need to use the UniswapV2 Router and Factory addresses
      const uniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
      const uniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

      const uniswapRouter = await hre.ethers.getContractAt("IUniswapV2Router02", uniswapRouterAddress);
      const uniswapFactory = await hre.ethers.getContractAt("IUniswapV2Factory", uniswapFactoryAddress);

      // Get the WETH address
      const wethAddress = await uniswapRouter.WETH();
      // Get the pair address and the pair contract
      const pairAddress = await uniswapFactory.getPair(benBKToken.target, wethAddress);
      const pairContract = await hre.ethers.getContractAt("IUniswapV2Pair", pairAddress);

      // We need to add liquidity to the pair
      const amountBenBKToken = hre.ethers.parseEther('100');
      const amountWETH = hre.ethers.parseEther('0.01');

      // Approve the router to spend the tokens
      await benBKToken.approve(uniswapRouterAddress, amountBenBKToken);

      // Add liquidity with proper token ordering
      const tx = await uniswapRouter.addLiquidityETH( 
        benBKToken.target,
        amountBenBKToken,
        0,  // Accept any amount of tokens
        0,  // Accept any amount of ETH
        owner.address,
        (await time.latest()) + 1000,
        { value: amountWETH }
      );

      // Wait for transaction to be mined
      await tx.wait();

      // Get the reserves and the tokens in the pair
      const [reserve0, reserve1,] = await pairContract.getReserves();
      const token0 = await pairContract.token0();
      const token1 = await pairContract.token1();

      assert(reserve0 === amountBenBKToken);
      assert(reserve1 === amountWETH);
      assert(token0 === benBKToken.target);
      assert(token1 === wethAddress);
    })
  })

  describe("Remove Liquidity", function() {
    it('Should remove liquidity from the UniswapV2 Pool', async function() {
      const { benBKToken, owner, account2, account3 } = await loadFixture(deployBenBKTokenFixture);

      // We fork the Ethereum Mainnet, we need to use the UniswapV2 Router and Factory addresses
      const uniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
      const uniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

      const uniswapRouter = await hre.ethers.getContractAt("IUniswapV2Router02", uniswapRouterAddress);
      const uniswapFactory = await hre.ethers.getContractAt("IUniswapV2Factory", uniswapFactoryAddress);

      // Get the WETH address
      const wethAddress = await uniswapRouter.WETH();
      // Get the pair address and the pair contract
      const pairAddress = await uniswapFactory.getPair(benBKToken.target, wethAddress);
      const pairContract = await hre.ethers.getContractAt("IUniswapV2Pair", pairAddress);

      const amountBenBKToken = hre.ethers.parseEther('100');
      const amountWETH = hre.ethers.parseEther('0.01');

      // Approve the router to spend the tokens
      await benBKToken.approve(uniswapRouterAddress, amountBenBKToken);

      // Add liquidity with proper token ordering
      const tx = await uniswapRouter.addLiquidityETH(  
        benBKToken.target,
        amountBenBKToken,
        0,  // Accept any amount of tokens
        0,  // Accept any amount of ETH
        owner.address,
        (await time.latest()) + 1000,
        { value: amountWETH }
      );

      // Wait for transaction to be mined
      await tx.wait();

      // Get the reserves and the tokens in the pair
      const [reserve0, reserve1,] = await pairContract.getReserves();
      const token0 = await pairContract.token0();
      const token1 = await pairContract.token1();

      assert(reserve0 === amountBenBKToken);
      assert(reserve1 === amountWETH);
      assert(token0 === benBKToken.target);
      assert(token1 === wethAddress);

      // We need to remove liquidity from the pair
      // Get the balance of the owner in the pair
      const lpTokenBalance = await pairContract.balanceOf(owner.address);

      // Approve the router to spend the tokens
      await pairContract.approve(uniswapRouterAddress, lpTokenBalance);

      const tx2 = await uniswapRouter.removeLiquidityETH(
        benBKToken.target,
        lpTokenBalance,
        0,
        0,
        owner.address,
        (await time.latest()) + 1000
      )

      await tx2.wait();

      // After removing liquidity, add these assertions
      const [newReserve0, newReserve1,] = await pairContract.getReserves();
      
      // Check if the remaining amounts are very small (less than 0.001% of original amounts)
      const remainingToken0Percentage = (newReserve0 * BigInt(100000)) / amountBenBKToken;
      const remainingToken1Percentage = (newReserve1 * BigInt(100000)) / amountWETH;
      
      expect(remainingToken0Percentage).to.be.lessThan(100n); // Less than 0.1%
      expect(remainingToken1Percentage).to.be.lessThan(100n); // Less than 0.1%
      
      // Log the percentages for debugging
      console.log(`Remaining token0: ${remainingToken0Percentage/1000n}%`);
      console.log(`Remaining token1: ${remainingToken1Percentage/1000n}%`);
    })
  })

  describe("Swap", function() {
    it("Should swap exact ETH for tokens", async function() {
      const { benBKToken, owner } = await loadFixture(deployBenBKTokenFixture);

      // Add liquidity to the pair
      // We fork the Ethereum Mainnet, we need to use the UniswapV2 Router and Factory addresses
      const uniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
      const uniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

      const uniswapRouter = await hre.ethers.getContractAt("IUniswapV2Router02", uniswapRouterAddress);
      const uniswapFactory = await hre.ethers.getContractAt("IUniswapV2Factory", uniswapFactoryAddress);

      // Get the WETH address
      const wethAddress = await uniswapRouter.WETH();
      // Get the pair address and the pair contract
      const pairAddress = await uniswapFactory.getPair(benBKToken.target, wethAddress);
      const pairContract = await hre.ethers.getContractAt("IUniswapV2Pair", pairAddress);

      // We need to add liquidity to the pair
      const amountBenBKToken = hre.ethers.parseEther('100');
      const amountWETH = hre.ethers.parseEther('1');

      // Approve the router to spend the tokens
      await benBKToken.approve(uniswapRouterAddress, amountBenBKToken);

      // Add liquidity with proper token ordering
      const tx = await uniswapRouter.addLiquidityETH( 
        benBKToken.target,
        amountBenBKToken,
        0,  // Accept any amount of tokens
        0,  // Accept any amount of ETH
        owner.address,
        (await time.latest()) + 1000,
        { value: amountWETH }
      );

      // Wait for transaction to be mined
      await tx.wait();

      // SWAP      
      // Get the amount of ETH to swap
      const amountETHIn = hre.ethers.parseEther('0.1');

      // Get the reserves and the tokens in the pair
      const [reserve0, reserve1,] = await pairContract.getReserves();
      const token0 = await pairContract.token0();
      const token1 = await pairContract.token1();

      console.log(`Reserve0: ${reserve0}`);
      console.log(`Reserve1: ${reserve1}`);
      
      // Swap ETH for tokens
      await uniswapRouter.swapExactETHForTokens(
        hre.ethers.parseEther('1'), // accept any amount of tokens
        // path is the array of tokens in the pair
        [await uniswapRouter.WETH(), benBKToken.target],
        // The address to send the tokens to
        owner.address,
        // The deadline for the transaction
        (await time.latest()) + 1000,
        // The value is the amount of ETH to swap
        { value: amountETHIn }
      );
      
      // Get the reserves and the tokens in the pair
      const [newReserve0, newReserve1,] = await pairContract.getReserves();

      console.log(`Reserve0 after swap: ${newReserve0}`);
      console.log(`Reserve1 after swap: ${newReserve1}`);

      // Check if the reserves have changed
      expect(newReserve0).to.be.lessThan(reserve0);
      expect(newReserve1).to.be.greaterThan(reserve1);
    });
  
    it("Should swap exact ETH for tokens", async function() {
      const { benBKToken, owner } = await loadFixture(deployBenBKTokenFixture);

      // Add liquidity to the pair
      // We fork the Ethereum Mainnet, we need to use the UniswapV2 Router and Factory addresses
      const uniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
      const uniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

      const uniswapRouter = await hre.ethers.getContractAt("IUniswapV2Router02", uniswapRouterAddress);
      const uniswapFactory = await hre.ethers.getContractAt("IUniswapV2Factory", uniswapFactoryAddress);

      // Get the WETH address
      const wethAddress = await uniswapRouter.WETH();
      // Get the pair address and the pair contract
      const pairAddress = await uniswapFactory.getPair(benBKToken.target, wethAddress);
      const pairContract = await hre.ethers.getContractAt("IUniswapV2Pair", pairAddress);

      // We need to add liquidity to the pair
      const amountBenBKToken = hre.ethers.parseEther('100');
      const amountWETH = hre.ethers.parseEther('1');

      // Approve the router to spend the tokens
      await benBKToken.approve(uniswapRouterAddress, amountBenBKToken);

      // Add liquidity with proper token ordering
      const tx = await uniswapRouter.addLiquidityETH( 
        benBKToken.target,
        amountBenBKToken,
        0,  // Accept any amount of tokens
        0,  // Accept any amount of ETH
        owner.address,
        (await time.latest()) + 1000,
        { value: amountWETH }
      );

      // Wait for transaction to be mined
      await tx.wait();

      // SWAP      
      // Get the amount of ETH to swap
      const amountTokenIn = hre.ethers.parseEther('50');

      // Get the reserves and the tokens in the pair
      const [reserve0, reserve1,] = await pairContract.getReserves();
      const token0 = await pairContract.token0();
      const token1 = await pairContract.token1();

      console.log(`Reserve0: ${reserve0}`);
      console.log(`Reserve1: ${reserve1}`);
      
      // Add approval before swap
      await benBKToken.approve(uniswapRouterAddress, amountTokenIn);

      // Swap ETH for tokens
      await uniswapRouter.swapExactTokensForETH(
        amountTokenIn,
        hre.ethers.parseEther('0.3'),
        [benBKToken.target, await uniswapRouter.WETH()],
        owner.address,
        (await time.latest()) + 1000
      )

      // Get the reserves and the tokens in the pair
      const [newReserve0, newReserve1,] = await pairContract.getReserves();

      console.log(`Reserve0 after swap: ${newReserve0}`);
      console.log(`Reserve1 after swap: ${newReserve1}`);

      // Check if the reserves have changed
      expect(newReserve0).to.be.greaterThan(reserve0);
      expect(newReserve1).to.be.lessThan(reserve1);
    });
  });
});
