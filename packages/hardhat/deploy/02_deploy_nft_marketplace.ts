import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * 部署NFTMarketplace合约
 *
 * @param hre HardhatRuntimeEnvironment对象
 */
const deployNFTMarketplace: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    在本地主机上，部署者账户是Hardhat自带的账户，已经有资金。

    当部署到实时网络时（例如 `yarn deploy --network sepolia`），部署者账户
    应该有足够的余额来支付合约创建的燃气费用。

    你可以使用 `yarn generate` 命令生成一个随机账户，这会在.env文件中填充DEPLOYER_PRIVATE_KEY
    （然后在hardhat.config.ts中使用）
    你可以运行 `yarn account` 命令来检查你在每个网络中的余额。
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("NFTMarketplace", {
    from: deployer,
    // Contract constructor arguments
    args: [],
    log: true,
    // autoMine: 可以传递给deploy函数，通过自动挖矿合约部署交易来加快本地网络上的部署过程。在实时网络上没有效果。
    autoMine: true,
  });

  // 获取已部署的合约，以便在部署后与其交互。
  const nftMarketplace = await hre.ethers.getContract<Contract>("NFTMarketplace", deployer);
  console.log("👋 NFT Marketplace已部署到:", await nftMarketplace.getAddress());
};

export default deployNFTMarketplace;

// Tags（标签）在你有多个部署文件且只想运行其中一个时很有用。
// 例如：yarn deploy --tags NFTMarketplace
deployNFTMarketplace.tags = ["NFTMarketplace"];