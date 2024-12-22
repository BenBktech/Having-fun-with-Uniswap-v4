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

  describe("Slippage Tests", function() {
    it("Should handle slippage correctly with a Low Liquidity Pool", async function() {
      const { benBKToken, owner } = await loadFixture(deployBenBKTokenFixture);
      
      // Setup: Get Uniswap contracts
      // We fork the Ethereum Mainnet, we need to use the UniswapV2 Router and Factory addresses
      const uniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
      const uniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

      const uniswapRouter = await hre.ethers.getContractAt("IUniswapV2Router02", uniswapRouterAddress);
      const uniswapFactory = await hre.ethers.getContractAt("IUniswapV2Factory", uniswapFactoryAddress);
      const wethAddress = await uniswapRouter.WETH();
      
      // Test Case 1: Low liquidity pool
      const lowLiquidityAmount = {
        tokens: hre.ethers.parseEther('1000'),
        eth: hre.ethers.parseEther('0.1')
      };
      
      // Add initial low liquidity
      await benBKToken.approve(uniswapRouter.target, lowLiquidityAmount.tokens);
      await uniswapRouter.addLiquidityETH(
        benBKToken.target,
        lowLiquidityAmount.tokens,
        0,
        0,
        owner.address,
        (await time.latest()) + 1000,
        { value: lowLiquidityAmount.eth }
      );
      
      // Try to swap a relatively large amount compared to pool size
      const largeSwapAmount = hre.ethers.parseEther('0.05'); // 50% of pool's ETH
      
      // Get quote before swap
      const amountsOut = await uniswapRouter.getAmountsOut(
        largeSwapAmount,
        [wethAddress, benBKToken.target]
      );
      
      // Execute swap with high slippage protection
      const minAmountOut = (amountsOut[1] * 90n) / 100n; // Accept up to 10% slippage
      const balanceBefore = await benBKToken.balanceOf(owner.address);
      console.log(`Owner's Balance of BenBKToken before: ${hre.ethers.formatEther(balanceBefore.toString())} BBK`);
      console.log(`Min amount of BenBKToken out: ${hre.ethers.formatEther(minAmountOut.toString())} BBK`);
      
      // Get the reserves and the tokens in the pair
      // Get the pair address and the pair contract
      const pairAddress = await uniswapFactory.getPair(benBKToken.target, wethAddress);
      const pairContract = await hre.ethers.getContractAt("IUniswapV2Pair", pairAddress);

      // We need to add liquidity to the pair
      const amountBenBKToken = hre.ethers.parseEther('100');
      const amountWETH = hre.ethers.parseEther('1');

      // Approve the router to spend the tokens
      await benBKToken.approve(uniswapRouterAddress, amountBenBKToken);

      // Get the reserves and the tokens in the pair
      const [reserve0, reserve1,] = await pairContract.getReserves();
      const token0 = await pairContract.token0();
      const token1 = await pairContract.token1();

      console.log(`Reserve BenBKToken: ${hre.ethers.formatEther(reserve0.toString())} BBK`);
      console.log(`Reserve ETH: ${hre.ethers.formatEther(reserve1.toString())} ETH`);

      // Swap
      await uniswapRouter.swapExactETHForTokens(
        minAmountOut,
        [wethAddress, benBKToken.target],
        owner.address,
        (await time.latest()) + 1000,
        { value: largeSwapAmount }
      );
      const balanceAfter = await benBKToken.balanceOf(owner.address);
      const actualReceived = balanceAfter - balanceBefore;
      console.log(`Owner's Balance of BenBKToken after: ${hre.ethers.formatEther(balanceAfter.toString())} BBK`);
      console.log(`Actual received: ${hre.ethers.formatEther(actualReceived.toString())} BBK`);

      // Get the reserves and the tokens in the pair
      const [reserve0AfterSwap, reserve1AfterSwap,] = await pairContract.getReserves();
      const token0AfterSwap = await pairContract.token0();
      const token1AfterSwap = await pairContract.token1();

      console.log(`Reserve BenBKToken After Swap: ${hre.ethers.formatEther(reserve0AfterSwap.toString())} BBK`);
      console.log(`Reserve ETH After Swap : ${hre.ethers.formatEther(reserve1AfterSwap.toString())} ETH`);
      
      // // Test Case 2: High liquidity pool
      // // Add more liquidity to create a deeper pool
      // const highLiquidityAmount = {
      //   tokens: hre.ethers.parseEther('100000'),
      //   eth: hre.ethers.parseEther('10')
      // };
      //  await benBKToken.approve(uniswapRouter.target, highLiquidityAmount.tokens);
      // await uniswapRouter.addLiquidityETH(
      //   benBKToken.target,
      //   highLiquidityAmount.tokens,
      //   0,
      //   0,
      //   owner.address,
      //   (await time.latest()) + 1000,
      //   { value: highLiquidityAmount.eth }
      // );
      //  // Same swap amount in high liquidity conditions
      // const amountsOutHighLiquidity = await uniswapRouter.getAmountsOut(
      //   largeSwapAmount,
      //   [wethAddress, benBKToken.target]
      // );
      //  const balanceBeforeHighLiquidity = await benBKToken.balanceOf(owner.address);
      
      // await uniswapRouter.swapExactETHForTokens(
      //   0, // No slippage protection for testing
      //   [wethAddress, benBKToken.target],
      //   owner.address,
      //   (await time.latest()) + 1000,
      //   { value: largeSwapAmount }
      // );
      //  const balanceAfterHighLiquidity = await benBKToken.balanceOf(owner.address);
      // const actualReceivedHighLiquidity = balanceAfterHighLiquidity - balanceBeforeHighLiquidity;
      //  // Assertions
      // // 1. Verify that the actual received amount in low liquidity is less than the quoted amount
      // expect(actualReceived).to.be.lessThan(amountsOut[1]);
      
      // // 2. Verify that high liquidity swap has less slippage
      // const lowLiquiditySlippage = ((amountsOut[1] - actualReceived) * 100n) / amountsOut[1];
      // const highLiquiditySlippage = ((amountsOutHighLiquidity[1] - actualReceivedHighLiquidity) * 100n) / amountsOutHighLiquidity[1];
      // expect(highLiquiditySlippage).to.be.lessThan(lowLiquiditySlippage);
      //  // 3. Verify that the high liquidity swap is closer to the quoted amount
      // const highLiquidityDifference = ((amountsOutHighLiquidity[1] - actualReceivedHighLiquidity) * 10000n) / amountsOutHighLiquidity[1];
      // expect(highLiquidityDifference).to.be.lessThan(100n); // Less than 1% difference
      //  // Log results for analysis
      // console.log(`Low Liquidity Slippage: ${lowLiquiditySlippage/100n}%`);
      // console.log(`High Liquidity Slippage: ${highLiquiditySlippage/100n}%`);
    });

    it("Should handle slippage correctly with a High Liquidity Pool", async function() {
      const { benBKToken, owner } = await loadFixture(deployBenBKTokenFixture);
      
      // Setup: Get Uniswap contracts
      // We fork the Ethereum Mainnet, we need to use the UniswapV2 Router and Factory addresses
      const uniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
      const uniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

      const uniswapRouter = await hre.ethers.getContractAt("IUniswapV2Router02", uniswapRouterAddress);
      const uniswapFactory = await hre.ethers.getContractAt("IUniswapV2Factory", uniswapFactoryAddress);
      const wethAddress = await uniswapRouter.WETH();
      
      // Test Case 2: High liquidity pool
      const highLiquidityAmount = {
        tokens: hre.ethers.parseEther('100000'),
        eth: hre.ethers.parseEther('100')
      };
      
      // Add initial low liquidity
      await benBKToken.approve(uniswapRouter.target, highLiquidityAmount.tokens);
      await uniswapRouter.addLiquidityETH(
        benBKToken.target,
        highLiquidityAmount.tokens,
        0,
        0,
        owner.address,
        (await time.latest()) + 1000,
        { value: highLiquidityAmount.eth }
      );
      
      // Try to swap a relatively large amount compared to pool size
      const swapAmount = hre.ethers.parseEther('1'); // 50% of pool's ETH
      
      // Get quote before swap
      const amountsOut = await uniswapRouter.getAmountsOut(
        swapAmount,
        [wethAddress, benBKToken.target]
      );

      console.log(`Amounts Out: ${hre.ethers.formatEther(amountsOut[1].toString())} BBK`);
      const balanceBeforeHighLiquidity = await benBKToken.balanceOf(owner.address);
      console.log(`Owner's Balance of BenBKToken before: ${hre.ethers.formatEther(balanceBeforeHighLiquidity.toString())} BBK`);

      await uniswapRouter.swapExactETHForTokens(
        0, // No slippage protection for testing
        [wethAddress, benBKToken.target],
        owner.address,
        (await time.latest()) + 1000,
        { value: swapAmount }
      );
      const balanceAfterHighLiquidity = await benBKToken.balanceOf(owner.address);
      const actualReceivedHighLiquidity = balanceAfterHighLiquidity - balanceBeforeHighLiquidity;

      console.log(`Owner's Balance of BenBKToken after: ${hre.ethers.formatEther(balanceAfterHighLiquidity.toString())} BBK`);
      console.log(`Actual received: ${hre.ethers.formatEther(actualReceivedHighLiquidity.toString())} BBK`);

      assert(actualReceivedHighLiquidity.toString() === amountsOut[1].toString());      
    });
    
    it("Should revert when slippage tolerance is exceeded", async function() {
      const { benBKToken, owner } = await loadFixture(deployBenBKTokenFixture);

      // Setup: Get Uniswap contracts
      // We fork the Ethereum Mainnet, we need to use the UniswapV2 Router and Factory addresses
      const uniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
      const uniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

      const uniswapRouter = await hre.ethers.getContractAt("IUniswapV2Router02", uniswapRouterAddress);
      const uniswapFactory = await hre.ethers.getContractAt("IUniswapV2Factory", uniswapFactoryAddress);
      const wethAddress = await uniswapRouter.WETH();

       // Add initial liquidity
      const liquidityAmount = {
        tokens: hre.ethers.parseEther('1000'),
        eth: hre.ethers.parseEther('1')
      };

      await benBKToken.approve(uniswapRouter.target, liquidityAmount.tokens);
      await uniswapRouter.addLiquidityETH(
        benBKToken.target,
        liquidityAmount.tokens,
        0,
        0,
        owner.address,
        (await time.latest()) + 1000,
        { value: liquidityAmount.eth }
      );

       // Try to swap with unrealistic slippage tolerance
      const swapAmount = hre.ethers.parseEther('0.1');
      const amountsOut = await uniswapRouter.getAmountsOut(
        swapAmount,
        [wethAddress, benBKToken.target]
      );

      console.log(`Swap Amount: ${hre.ethers.formatEther(swapAmount.toString())} ETH`);
      console.log(`Amounts Out: ${hre.ethers.formatEther(amountsOut[1].toString())} BBK`);
      
      
      // Set minimum output way too high (expecting 50% more than quoted)
      const unrealisticMinimumOut = (amountsOut[1] * 150n) / 100n;

      console.log(`Unrealistic Minimum Out: ${hre.ethers.formatEther(unrealisticMinimumOut.toString())} BBK`);
      
       // The transaction should revert
      await expect(
        uniswapRouter.swapExactETHForTokens(
          unrealisticMinimumOut,
          [wethAddress, benBKToken.target],
          owner.address,
          (await time.latest()) + 1000,
          { value: swapAmount }
        )
      ).to.be.revertedWith("UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT");
    });
  });
});