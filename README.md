<div align="center">
  <h1>🪙 BenBKToken (BBK)</h1>
  <p><strong>A Professional ERC20 Token with Advanced Uniswap V2 Integration</strong></p>
  <p>
    <a href="https://github.com/yourusername/benbktoken/actions">
      <img src="https://github.com/yourusername/benbktoken/workflows/Tests/badge.svg" alt="Tests Status" />
    </a>
    <a href="https://opensource.org/licenses/MIT">
      <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white" alt="TypeScript" />
    </a>
    <a href="https://soliditylang.org/">
      <img src="https://img.shields.io/badge/Solidity-%23363636.svg?logo=solidity&logoColor=white" alt="Solidity" />
    </a>
  </p>
</div>

## 📝 Overview

BenBKToken (BBK) is a professional-grade ERC20 token implementation featuring seamless Uniswap V2 integration. Built with security and flexibility in mind, it provides a robust foundation for decentralized trading and liquidity provision.

## ✨ Key Features

- **Advanced Token Economics**
  - Initial supply: 1M BBK
  - Maximum supply: 1.2M BBK
  - Controlled minting mechanism
  
- **Uniswap V2 Integration**
  - Automated liquidity pair creation with WETH
  - Liquidity management (add/remove)
  - Token swapping capabilities
  - Built-in slippage protection

- **Security First**
  - Comprehensive test coverage
  - Industry-standard security patterns
  - OpenZeppelin contract foundations

## 🛠 Technical Stack

- **Smart Contracts**: Solidity ^0.8.28
- **Development Framework**: Hardhat
- **Testing**: Chai & Hardhat Network
- **Contract Dependencies**:
  - OpenZeppelin Contracts
  - Uniswap V2 Protocol

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/benbktoken.git
cd benbktoken
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
# Add your environment variables
```

## 💻 Development

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test test/BenBKToken/deployment.test.ts

# Run tests with coverage
npm run coverage
```

### Local Deployment

```bash
# Start local node
npm run node

# Deploy contracts
npm run deploy:local
```

## 🧪 Test Coverage

Our test suite is organized into logical modules:

- `deployment.test.ts`: Contract deployment and initialization
- `liquidity.test.ts`: Liquidity management operations
- `swaps.test.ts`: Token swapping functionality
- `slippage.test.ts`: Slippage protection scenarios

## 📖 Documentation

Detailed documentation is available in the [`docs`](./docs) directory:

- [Contract Architecture](./docs/ARCHITECTURE.md)
- [Security Considerations](./docs/SECURITY.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🤝 Contributing

Contributions are welcome! Please check our [Contributing Guidelines](./CONTRIBUTING.md) for details on how to submit pull requests, report issues, and contribute to the project.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) for secure contract implementations
- [Uniswap](https://uniswap.org/) for DEX infrastructure
- The Ethereum community for continuous support and inspiration

---

<div align="center">
  <sub>Built with ❤️ by BenBK</sub>
</div>
