// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/IUniswapV2Factory.sol";
import "./interfaces/IUniswapV2Pair.sol";
import "./interfaces/IERC20.sol";

contract BenBKToken is ERC20, Ownable {

    IUniswapV2Router02 private uniswapV2Router02;
    IUniswapV2Factory private uniswapV2Factory;
    IUniswapV2Pair private uniswapV2Pair;

    uint256 public constant MAX_SUPPLY = 1200000 ether;

    constructor(address initialOwner, address _uniswapV2Router02, address _uniswapV2Factory)
        ERC20("BenBKToken", "BBK")
        Ownable(initialOwner)
    {
        mint(msg.sender, 1000000 ether);
        uniswapV2Router02 = IUniswapV2Router02(_uniswapV2Router02);
        uniswapV2Factory = IUniswapV2Factory(_uniswapV2Factory);

        // Obtenir l'adresse WETH depuis le router
        address weth = uniswapV2Router02.WETH();
        
        // Créer ou récupérer la paire WETH/BenBKToken
        address pair = uniswapV2Factory.getPair(address(this), weth);
        if (pair == address(0)) {
            pair = uniswapV2Factory.createPair(address(this), weth);
        }
        uniswapV2Pair = IUniswapV2Pair(pair);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
}