# BenBKToken - ERC20 Token with Uniswap Integration

This project implements a custom ERC20 token (BenBKToken/BBK) with Uniswap V2 integration, allowing for decentralized trading functionality. The project uses Hardhat for development and testing.

## Features

- ERC20 token implementation with a max supply of 1.2M tokens
- Uniswap V2 integration for:
  - Liquidity provision (add/remove)
  - Token swapping (ETH <-> BBK)
  - Slippage protection
- Comprehensive test suite for all functionalities

## Technical Stack

- Solidity ^0.8.28
- Hardhat
- OpenZeppelin Contracts
- Uniswap V2 Protocol

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- An Ethereum development environment

### Installation

1. Clone the repository:
```shell
git clone <repository-url>
cd benbktoken
```

2. Install dependencies:
```shell
npm install
```

### Running Tests

```shell
npx hardhat test
```

For gas reporting:
```shell
REPORT_GAS=true npx hardhat test
```

### Deployment

To deploy the contract using Hardhat Ignition:
```shell
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

### Local Development

Start a local Hardhat node:
```shell
npx hardhat node
```

## Contract Details

The BenBKToken contract includes:
- Initial supply of 1M tokens
- Maximum supply of 1.2M tokens
- Owner-only minting capability
- Direct integration with Uniswap V2 Router and Factory
- Automated liquidity pair creation with WETH

## Testing

The test suite covers:
- Basic token functionality
- Liquidity management
- Token swapping
- Slippage protection scenarios
- High and low liquidity pool behavior

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
