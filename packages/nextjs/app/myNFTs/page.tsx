"use client";

import { useEffect, useState } from "react";
import { AirdropMinter, BatchNFTMinter, CustomNFTMinter, ExcelBatchMinter, MyBlindAuctions, MyHoldings, MyListings } from "./_components";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { addToIPFS } from "~~/utils/simpleNFT/ipfs-fetch";
import nftsMetadata from "~~/utils/simpleNFT/nftsMetadata";

/**
 * @dev 我的NFT页面
 */
const MyNFTs: NextPage = () => {
  const { address: connectedAddress, isConnected, isConnecting } = useAccount();

  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "YourCollectible" });

  const { data: tokenIdCounter } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "tokenIdCounter",
    watch: true,
  });

  const handleMintItem = async () => {
    // 如果到达数组末尾，回到第一个项目
    if (tokenIdCounter === undefined) return;

    const tokenIdCounterNumber = Number(tokenIdCounter);
    const currentTokenMetaData = nftsMetadata[tokenIdCounterNumber % nftsMetadata.length];
    const notificationId = notification.loading("正在上传到IPFS");
    try {
      const uploadedItem = await addToIPFS(currentTokenMetaData);

      // 先移除之前的加载通知，然后显示成功通知
      notification.remove(notificationId);
      notification.success("元数据已上传到IPFS");

      await writeContractAsync({
        functionName: "mintItem",
        args: [connectedAddress, uploadedItem.path],
      });
    } catch (error) {
      notification.remove(notificationId);
      console.error(error);
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <div className="flex items-center flex-col pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">我的NFT</span>
          </h1>
        </div>
      </div>

      {!mounted || !isConnected || isConnecting ? (
        <div className="flex justify-center">
          <RainbowKitCustomConnectButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 justify-center items-start px-5 mb-8">
          {/* 原始铸造NFT */}
          <div className="card bg-base-100 shadow-xl w-full max-w-md mx-auto">
            <div className="card-body">
              <h2 className="card-title text-center">铸造预设NFT</h2>
              <p className="text-center text-sm opacity-70 mb-4">从预定义集合中铸造</p>
              <button className="btn btn-secondary" onClick={handleMintItem}>
                铸造NFT
              </button>
            </div>
          </div>

          {/* 自定义NFT铸造器 */}
          <CustomNFTMinter />

          {/* 批量NFT铸造器 */}
          <BatchNFTMinter />

          {/* Excel批量NFT铸造器 */}
          <ExcelBatchMinter />

          {/* 空投NFT铸造器 */}
          <AirdropMinter />
        </div>
      )}

      <MyHoldings />
      <MyListings />
      <MyBlindAuctions />
    </>
  );
};

export default MyNFTs;
