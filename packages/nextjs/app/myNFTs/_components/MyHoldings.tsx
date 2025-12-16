"use client";

import { useEffect, useMemo, useState } from "react";
import { NFTCard } from "./NFTCard";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
// 新增：写合约的 hook 与价格解析
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { getMetadataFromIPFS } from "~~/utils/simpleNFT/ipfs-fetch";
import { NFTMetaData } from "~~/utils/simpleNFT/nftsMetadata";

export interface Collectible extends Partial<NFTMetaData> {
  id: number;
  uri: string;
  owner: string;
  isListed?: boolean;
}

export const MyHoldings = () => {
  const { address: connectedAddress } = useAccount();
  const [myAllCollectibles, setMyAllCollectibles] = useState<Collectible[]>([]);
  const [allCollectiblesLoading, setAllCollectiblesLoading] = useState(false);

  // 搜索 & 分页状态
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // 新增：批量模式状态
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkPrice, setBulkPrice] = useState("");
  const [isBulkListing, setIsBulkListing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ listed: number; total: number; currentTokenId?: number }>();

  const { data: yourCollectibleContract } = useScaffoldContract({
    contractName: "YourCollectible",
  });

  const { data: marketplaceContract } = useScaffoldContract({
    contractName: "NFTMarketplace",
  });

  // 新增：批量上架所需写合约方法与地址
  const { writeContractAsync: writeCollectible } = useScaffoldWriteContract({ contractName: "YourCollectible" });
  const { writeContractAsync: writeMarketplace } = useScaffoldWriteContract({ contractName: "NFTMarketplace" });

  // 从合约实例获取地址，如果没有则使用环境变量
  const nftContractAddress =
    yourCollectibleContract?.address || process.env.NEXT_PUBLIC_YOUR_COLLECTIBLE_ADDRESS || "0x0";
  const marketplaceAddress = marketplaceContract?.address || process.env.NEXT_PUBLIC_NFT_MARKETPLACE_ADDRESS || "0x0";

  const { data: myTotalBalance } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "balanceOf",
    args: [connectedAddress],
    watch: true,
  });

  // 获取所有活跃的市场列表，用于检查是否已上架
  const { data: activeListings } = useScaffoldReadContract({
    contractName: "NFTMarketplace",
    functionName: "getAllActiveListings",
    watch: true,
  });

  useEffect(() => {
    const updateMyCollectibles = async (): Promise<void> => {
      if (myTotalBalance === undefined || yourCollectibleContract === undefined || connectedAddress === undefined)
        return;

      setAllCollectiblesLoading(true);
      const totalBalance = parseInt(myTotalBalance.toString());
      const tokens: { tokenId: bigint; tokenURI: string }[] = [];

      // 先读取链上 tokenId 与 tokenURI（通常较快）
      for (let tokenIndex = 0; tokenIndex < totalBalance; tokenIndex++) {
        try {
          const tokenId = (await yourCollectibleContract.read.tokenOfOwnerByIndex([
            connectedAddress,
            BigInt(tokenIndex),
          ])) as bigint;
          const tokenURI = (await yourCollectibleContract.read.tokenURI([tokenId])) as string;
          tokens.push({ tokenId, tokenURI });
        } catch (e) {
          console.log("读取链上 NFT 信息失败", e);
          notification.error("读取链上 NFT 信息失败");
        }
      }

      // 并发获取 metadata（避免逐条串行导致页面长时间转圈）
      // 限制并发数
      const CONCURRENCY_LIMIT = 5;
      const results: PromiseSettledResult<any>[] = [];

      for (let i = 0; i < tokens.length; i += CONCURRENCY_LIMIT) {
        const chunk = tokens.slice(i, i + CONCURRENCY_LIMIT);
        const chunkResults = await Promise.allSettled(
          chunk.map(t => {
            // 直接传入 tokenURI，服务端会规范化为 CID
            return getMetadataFromIPFS(t.tokenURI as unknown as string);
          }),
        );
        results.push(...chunkResults);
      }

      const collectibleUpdate: Collectible[] = [];
      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        const r = results[i];
        const base = {
          id: parseInt(t.tokenId.toString()),
          uri: t.tokenURI,
          owner: connectedAddress,
        } as Collectible;

        // Check if listed
        if (activeListings && Array.isArray(activeListings)) {
          const listing = activeListings.find((l: any) => l.tokenId === t.tokenId && l.active);
          if (listing) {
            base.isListed = true;
          }
        }

        if (r.status === "fulfilled" && r.value) {
          collectibleUpdate.push({ ...base, ...(r.value as NFTMetaData) });
        } else {
          // 即使元数据拉取失败，也先展示基本信息，避免整页不显示
          collectibleUpdate.push(base);
        }
      }

      collectibleUpdate.sort((a, b) => a.id - b.id);
      setMyAllCollectibles(collectibleUpdate);
      setAllCollectiblesLoading(false);
      // 重置分页到第一页
      setCurrentPage(1);
      // 重置批量选择
      setSelectedIds([]);
    };

    updateMyCollectibles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedAddress, myTotalBalance, activeListings]);

  // 派生：根据搜索过滤
  const filteredCollectibles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return myAllCollectibles;
    return myAllCollectibles.filter(item => {
      const name = (item.name || "").toLowerCase();
      const desc = (item.description || "").toLowerCase();
      const idStr = String(item.id);
      return name.includes(q) || desc.includes(q) || idStr.includes(q);
    });
  }, [myAllCollectibles, searchQuery]);

  // 分页切片
  const pageCount = Math.max(1, Math.ceil(filteredCollectibles.length / pageSize));
  const currentPageSafe = Math.min(currentPage, pageCount);
  const startIndex = (currentPageSafe - 1) * pageSize;
  const pageItems = filteredCollectibles.slice(startIndex, startIndex + pageSize);

  // 搜索输入处理
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // 分页控制
  const gotoPage = (p: number) => {
    const next = Math.max(1, Math.min(p, pageCount));
    setCurrentPage(next);
  };

  // 新增：批量上架逻辑
  const handleBulkList = async () => {
    if (selectedIds.length === 0 || !bulkPrice || parseFloat(bulkPrice) <= 0) {
      notification.warning("请选择NFT并输入有效价格");
      return;
    }
    // 地址就绪性校验，避免错误授权/上架到 0x0
    if (!nftContractAddress || nftContractAddress === "0x0" || !marketplaceAddress || marketplaceAddress === "0x0") {
      notification.error("合约地址未就绪，请稍后重试或检查部署");
      return;
    }
    if (!yourCollectibleContract || !marketplaceContract || !connectedAddress) {
      notification.error("合约未加载，请稍候再试");
      return;
    }
    try {
      setIsBulkListing(true);
      setBulkProgress({ listed: 0, total: selectedIds.length });

      // 检查是否已经授权
      const isApproved = (await yourCollectibleContract.read.isApprovedForAll([
        connectedAddress,
        marketplaceAddress,
      ])) as boolean;

      // 如果未授权，则先授权
      if (!isApproved) {
        notification.info("正在授权市场合约...");
        await writeCollectible(
          {
            functionName: "setApprovalForAll",
            args: [marketplaceAddress, true],
          },
          { blockConfirmations: 1 },
        );
        // 二次校验，确保链上状态已更新
        const approvedNow = (await yourCollectibleContract.read.isApprovedForAll([
          connectedAddress,
          marketplaceAddress,
        ])) as boolean;
        if (!approvedNow) {
          notification.error("授权未生效，请稍后重试");
          return;
        }
        notification.success("授权成功");
      }

      // 批量上架
      await writeMarketplace(
        {
          functionName: "batchListNFT",
          args: [nftContractAddress, selectedIds.map(id => BigInt(id)), parseEther(bulkPrice)],
        },
        { blockConfirmations: 1 },
      );
      setBulkProgress({ listed: selectedIds.length, total: selectedIds.length });
      notification.success("批量上架成功");
      setSelectedIds([]);
      setBulkPrice("");
      setBulkMode(false);
    } catch (e: any) {
      console.error("批量上架错误", e);
      notification.error(e?.message ? `批量上架失败: ${e.message}` : "批量上架失败，请重试");
    } finally {
      setIsBulkListing(false);
    }
  };

  if (allCollectiblesLoading)
    return (
      <div className="flex justify-center items-center mt-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  return (
    <>
      {/* 搜索与统计 */}
      <div className="px-5 mt-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="form-control w-full md:w-80">
          <input
            className="input input-bordered"
            placeholder="搜索名称、描述或ID"
            value={searchQuery}
            onChange={onSearchChange}
          />
        </div>
        <div className="text-sm opacity-70">
          共 {filteredCollectibles.length} / {myAllCollectibles.length} 项
        </div>
      </div>

      {/* 批量上架面板 */}
      <div className="px-5 mt-2 flex flex-wrap gap-3 items-center justify-between">
        {!bulkMode ? (
          <button className="btn btn-primary btn-sm" onClick={() => setBulkMode(true)}>
            批量上架
          </button>
        ) : (
          <div className="flex flex-wrap gap-2 items-center w-full">
            <input
              type="number"
              min="0"
              step="0.001"
              placeholder="统一价格(ETH)"
              className="input input-bordered input-sm w-40"
              value={bulkPrice}
              onChange={e => setBulkPrice(e.target.value)}
            />
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setSelectedIds(pageItems.filter(i => !i.isListed).map(i => i.id))}
            >
              全选本页
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => setSelectedIds([])}>
              清空选择
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setBulkMode(false);
                setSelectedIds([]);
              }}
            >
              退出批量
            </button>
            <button
              className="btn btn-primary btn-sm"
              disabled={isBulkListing || selectedIds.length === 0 || !bulkPrice || parseFloat(bulkPrice) <= 0}
              onClick={handleBulkList}
            >
              {isBulkListing ? (
                <>
                  <span className="loading loading-spinner loading-xs mr-1"></span>
                  上架中...
                </>
              ) : (
                <>上架选中({selectedIds.length})</>
              )}
            </button>
            {isBulkListing && bulkProgress ? (
              <span className="text-xs opacity-70">
                进度 {bulkProgress.listed}/{bulkProgress.total}
              </span>
            ) : null}
          </div>
        )}
      </div>

      {filteredCollectibles.length === 0 ? (
        <div className="flex justify-center items-center mt-10">
          <div className="text-2xl text-primary-content">未找到匹配的NFT</div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 my-6 px-5 justify-center">
            {pageItems.map(item => (
              <NFTCard
                nft={item}
                key={item.id}
                selectable={bulkMode && !item.isListed}
                selected={selectedIds.includes(item.id)}
                onSelectedChange={checked => {
                  setSelectedIds(prev => {
                    const exists = prev.includes(item.id);
                    if (checked) {
                      return exists ? prev : [...prev, item.id];
                    }
                    return prev.filter(id => id !== item.id);
                  });
                }}
              />
            ))}
          </div>

          {/* 分页控件 */}
          <div className="join flex justify-center my-6 px-5">
            <button
              className="join-item btn"
              onClick={() => gotoPage(currentPageSafe - 1)}
              disabled={currentPageSafe <= 1}
            >
              «
            </button>
            <button className="join-item btn">
              第 {currentPageSafe} / {pageCount} 页
            </button>
            <button
              className="join-item btn"
              onClick={() => gotoPage(currentPageSafe + 1)}
              disabled={currentPageSafe >= pageCount}
            >
              »
            </button>
          </div>
        </>
      )}
    </>
  );
};
