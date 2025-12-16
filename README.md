# 🏗 Scaffold-ETH 2 - Advanced NFT Marketplace

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Website</a>
</h4>

🧪 An open-source, up-to-date toolkit for building decentralized applications (dapps) on the Ethereum blockchain. This project is an advanced NFT marketplace implementation built on top of Scaffold-ETH 2.

## 🌟 Project Overview

This project goes beyond a simple NFT example, providing a comprehensive suite of tools for NFT minting, trading, and auctioning. It demonstrates advanced smart contract interactions and a polished user experience.

## ✨ Key Features

### 🎨 Diverse Minting Options
We provide multiple ways to create NFTs to suit different needs:
- **Custom Mint**: Upload your own image, set a name and description, and mint a unique NFT.
- **Batch Mint**: Efficiently mint multiple NFTs with the same metadata in a single transaction.
- **Excel/CSV Mint**: Power users can upload a CSV file to batch mint NFTs with unique metadata for each item.
- **Airdrop**: Distribute NFTs to a list of addresses in one go, perfect for community rewards.

### 🏪 Full-Featured Marketplace
A robust trading platform with advanced features:
- **Buy & Sell**: List your NFTs for sale and purchase others instantly.
- **Offers System**: Make offers on any NFT (even those not listed). Sellers can accept the best offer.
- **Bulk Operations**: Save time and Gas by batch listing and batch buying multiple NFTs at once.
- **Search & Filter**: Easily find assets with client-side filtering and search capabilities.

### 🙈 Blind Auctions
Experience a fair price discovery mechanism:
- **Commit-Reveal Scheme**: Participants submit sealed bids (hashed) during the commit phase.
- **Privacy**: Bid amounts remain hidden until the reveal phase, preventing bid sniping and copying.
- **Automatic Settlement**: Winners get the NFT, and non-winners can easily reclaim their funds.

### 🛠 IPFS Integration
- **Upload & Download**: Dedicated utilities to interact with IPFS, ensuring decentralized storage for all NFT metadata and assets.

## 🚀 Quick Start

1.  **Start your local network**:
    ```bash
    yarn chain
    ```

2.  **Deploy your contracts**:
    ```bash
    yarn deploy
    ```

3.  **Start the frontend**:
    ```bash
    yarn start
    ```

4.  Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📦 Smart Contracts

-   `YourCollectible.sol`: The ERC-721 NFT contract with extended minting capabilities.
-   `NFTMarketplace.sol`: The core marketplace logic handling listings, offers, and auctions.

## 📚 Documentation

Visit [docs.scaffoldeth.io](https://docs.scaffoldeth.io) to learn more about the underlying stack.

## 🛠 Configuration Guide

If you want to customize this project or deploy it to a different network, follow these steps:

### 1. Network Configuration
-   **Frontend**: Edit `packages/nextjs/scaffold.config.ts`.
    -   Change `targetNetwork` to your desired chain (e.g., `chains.sepolia`, `chains.mainnet`, or a custom defined chain like `localgeth`).
-   **Backend (Hardhat)**: Edit `packages/hardhat/hardhat.config.ts`.
    -   Add or modify network configurations in the `networks` object.
    -   Ensure `defaultNetwork` is set correctly if not specifying `--network` flag during deployment.

### 2. Environment Variables
Copy `.env.example` to `.env` in both `packages/hardhat` and `packages/nextjs` directories and fill in the required values.

**`packages/hardhat/.env`**:
-   `DEPLOYER_PRIVATE_KEY`: **REQUIRED**. The private key of the account that will deploy the contracts. You **MUST** set this value.
-   `ALCHEMY_API_KEY`: (Optional) For forking or deploying to networks using Alchemy RPC.
-   `ETHERSCAN_API_KEY`: (Optional) For verifying contracts on Etherscan.

**`packages/nextjs/.env.local`**:
-   `NEXT_PUBLIC_PINATA_API_KEY`: Your Pinata API Key for IPFS uploads.
-   `NEXT_PUBLIC_PINATA_SECRET_API_KEY`: Your Pinata Secret Key.
-   `NEXT_PUBLIC_GATEWAY_URL`: (Optional) Your dedicated IPFS gateway URL.

### 3. Contract Addresses
-   When deploying to `localhost` or `hardhat` network, contract addresses are automatically updated in `packages/nextjs/contracts/deployedContracts.ts`.
-   If you are using a custom network or need to manually override addresses, you can edit `packages/nextjs/contracts/deployedContracts.ts` or ensure your deployment script updates this file.

---

# 🏗 Scaffold-ETH 2 - 高级 NFT 市场

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">文档</a> |
  <a href="https://scaffoldeth.io">官网</a>
</h4>

🧪 一个开源、最新的工具包，用于在以太坊区块链上构建去中心化应用程序 (dapps)。本项目是基于 Scaffold-ETH 2 构建的高级 NFT 市场实现。

## 🌟 项目概览

本项目不仅仅是一个简单的 NFT 示例，它提供了一整套用于 NFT 铸造、交易和拍卖的工具。它展示了高级智能合约交互和完善的用户体验。

## ✨ 主要功能

### 🎨 多样化的铸造选项
我们提供多种创建 NFT 的方式以满足不同需求：
- **自定义铸造 (Custom Mint)**：上传您自己的图片，设置名称和描述，铸造独一无二的 NFT。
- **批量铸造 (Batch Mint)**：在单笔交易中高效铸造多个具有相同元数据的 NFT。
- **Excel/CSV 铸造**：高级用户可以上传 CSV 文件，批量铸造每个项目具有独特元数据的 NFT。
- **空投 (Airdrop)**：一次性向地址列表分发 NFT，非常适合社区奖励。

### 🏪 全功能市场
一个具有高级功能的强大交易平台：
- **买卖**：列出您的 NFT 进行出售，并即时购买其他 NFT。
- **报价系统 (Offers)**：对任何 NFT（即使未上架）进行报价。卖家可以接受最佳报价。
- **批量操作**：通过批量上架和批量购买多个 NFT，节省时间和 Gas 费。
- **搜索与过滤**：通过客户端过滤和搜索功能轻松查找资产。

### 🙈 盲拍 (Blind Auctions)
体验公平的价格发现机制：
- **提交-揭示机制**：参与者在提交阶段提交密封出价（哈希值）。
- **隐私**：出价金额在揭示阶段之前保持隐藏，防止恶意抬价和抄袭。
- **自动结算**：获胜者获得 NFT，未获胜者可以轻松取回资金。

### 🛠 IPFS 集成
- **上传与下载**：专用的 IPFS 交互工具，确保所有 NFT 元数据和资产的去中心化存储。

## 🚀 快速开始

1.  **启动本地网络**：
    ```bash
    yarn chain
    ```

2.  **部署合约**：
    ```bash
    yarn deploy
    ```

3.  **启动前端**：
    ```bash
    yarn start
    ```

4.  打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📦 智能合约

-   `YourCollectible.sol`: 具有扩展铸造功能的 ERC-721 NFT 合约。
-   `NFTMarketplace.sol`: 处理上架、报价和拍卖的核心市场逻辑。

## 📚 文档

访问 [docs.scaffoldeth.io](https://docs.scaffoldeth.io) 了解更多关于底层技术栈的信息。

## 🛠 配置指南

如果您想自定义此项目或将其部署到不同的网络，请按照以下步骤操作：

### 1. 网络配置
-   **前端**: 编辑 `packages/nextjs/scaffold.config.ts`。
    -   将 `targetNetwork` 修改为您期望的链（例如 `chains.sepolia`, `chains.mainnet`, 或自定义定义的链如 `localgeth`）。
-   **后端 (Hardhat)**: 编辑 `packages/hardhat/hardhat.config.ts`。
    -   在 `networks` 对象中添加或修改网络配置。
    -   确保 `defaultNetwork` 设置正确，或者在部署时使用 `--network` 参数。

### 2. 环境变量
在 `packages/hardhat` 和 `packages/nextjs` 目录下，将 `.env.example` 复制为 `.env` 并填写所需的值。

**`packages/hardhat/.env`**:
-   `DEPLOYER_PRIVATE_KEY`: **必需**。用于部署合约的账户私钥。您**必须**设置此值。
-   `ALCHEMY_API_KEY`: (可选) 用于 Fork 或部署到使用 Alchemy RPC 的网络。
-   `ETHERSCAN_API_KEY`: (可选) 用于在 Etherscan 上验证合约。

**`packages/nextjs/.env.local`**:
-   `NEXT_PUBLIC_PINATA_API_KEY`: 您的 Pinata API Key，用于 IPFS 上传。
-   `NEXT_PUBLIC_PINATA_SECRET_API_KEY`: 您的 Pinata Secret Key。
-   `NEXT_PUBLIC_GATEWAY_URL`: (可选) 您的专用 IPFS 网关 URL。

### 3. 合约地址
-   当部署到 `localhost` 或 `hardhat` 网络时，合约地址会自动更新在 `packages/nextjs/contracts/deployedContracts.ts` 文件中。
-   如果您使用的是自定义网络或需要手动覆盖地址，可以编辑 `packages/nextjs/contracts/deployedContracts.ts`，或确保您的部署脚本会更新此文件。