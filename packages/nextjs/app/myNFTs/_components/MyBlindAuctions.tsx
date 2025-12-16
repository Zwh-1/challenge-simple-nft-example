"use client";
import { useEffect, useMemo, useState } from "react";
import { parseEther, encodeAbiParameters, keccak256, toHex } from "viem";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type BlindAuction = {
    id: bigint;
    seller: `0x${string}`;
    nftAddress: `0x${string}`;
    tokenId: bigint;
    minBid: bigint;
    commitEndTime: bigint;
    revealEndTime: bigint;
    finalized: boolean;
    winner?: `0x${string}`;
    highestBid?: bigint;
};

type NFTMetadata = {
    name?: string;
    description?: string;
    image?: string;
    attributes?: Array<{ trait_type: string; value: string }>;
};

function formatTime(ts?: bigint) {
    if (!ts) return "-";
    const d = new Date(Number(ts) * 1000);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

export const MyBlindAuctions = () => {
    const { address } = useAccount();
    const [now, setNow] = useState<number>(Math.floor(Date.now() / 1000));
    useEffect(() => {
        const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
        return () => clearInterval(t);
    }, []);

    const { data: auctionsData, isLoading: isLoadingAuctions, refetch } = useScaffoldReadContract({
        contractName: "NFTMarketplace",
        functionName: "getAllActiveBlindAuctions",
    });

    const { writeContractAsync: writeMarketplace } = useScaffoldWriteContract({ contractName: "NFTMarketplace", disableSimulate: true });

    const auctions: BlindAuction[] = useMemo(() => {
        if (!auctionsData || !address) return [] as BlindAuction[];
        const arr = Array.isArray(auctionsData) ? (auctionsData as any[]) : [];
        const normalizeBigInt = (v: any) => (typeof v === "bigint" ? v : v !== undefined ? BigInt(v) : undefined);

        return arr
            .map((a: any) => {
                const idRaw = a.auctionId ?? a.id ?? (Array.isArray(a) ? a[0] : undefined);
                const tokenIdRaw = a.tokenId ?? (Array.isArray(a) ? a[2] ?? a[3] : undefined);
                const minBidRaw = a.minBid ?? (Array.isArray(a) ? a[4] : undefined);
                const commitEndRaw = a.commitEnd ?? a.commitEndTime ?? (Array.isArray(a) ? a[5] : undefined);
                const revealEndRaw = a.revealEnd ?? a.revealEndTime ?? (Array.isArray(a) ? a[6] : undefined);

                const id = normalizeBigInt(idRaw);
                const tokenId = normalizeBigInt(tokenIdRaw);
                const minBid = normalizeBigInt(minBidRaw);
                const commitEndTime = normalizeBigInt(commitEndRaw);
                const revealEndTime = normalizeBigInt(revealEndRaw);

                if (
                    id === undefined ||
                    tokenId === undefined ||
                    minBid === undefined ||
                    commitEndTime === undefined ||
                    revealEndTime === undefined
                ) {
                    return null;
                }

                const seller = a.seller ?? (Array.isArray(a) ? a[3] ?? a[1] : undefined);

                return {
                    id,
                    seller,
                    nftAddress: a.nftContract ?? a.nftAddress ?? (Array.isArray(a) ? a[1] ?? a[2] : undefined),
                    tokenId,
                    minBid,
                    commitEndTime,
                    revealEndTime,
                    finalized: Boolean(a.finalized ?? (Array.isArray(a) ? a[8] : false)),
                    winner: a.highestBidder ?? a.winner ?? (Array.isArray(a) ? a[9] : undefined),
                    highestBid: normalizeBigInt(a.highestBid ?? (Array.isArray(a) ? a[10] : undefined)),
                } as BlindAuction;
            })
            .filter(Boolean)
            .filter(a => a?.seller?.toLowerCase() === address.toLowerCase()) as BlindAuction[];
    }, [auctionsData, address]);

    const [pendingId, setPendingId] = useState<string>("");

    // 盲拍NFT元数据缓存：tokenId -> metadata
    const [nftMetas, setNftMetas] = useState<Record<string, NFTMetadata | undefined>>({});
    useEffect(() => {
        const loadMetas = async () => {
            if (!auctions || auctions.length === 0) return;
            const missing = auctions.filter(a => !nftMetas[a.tokenId.toString()]);
            if (missing.length === 0) return;
            const results = await Promise.all(
                missing.map(async a => {
                    try {
                        const res = await fetch(`/api/nft/metadata/${a.tokenId}`);
                        if (res.ok) {
                            const meta = (await res.json()) as NFTMetadata;
                            return { key: a.tokenId.toString(), meta } as { key: string; meta: NFTMetadata };
                        }
                    } catch (e) {
                        console.error("获取元数据失败：", a.tokenId.toString(), e);
                    }
                    return { key: a.tokenId.toString(), meta: undefined } as { key: string; meta: NFTMetadata | undefined };
                })
            );
            setNftMetas(prev => {
                const next = { ...prev };
                for (const r of results) next[r.key] = r.meta;
                return next;
            });
        };
        loadMetas();
    }, [auctions]);

    const onFinalize = async (auctionId: bigint) => {
        try {
            setPendingId(auctionId.toString());
            await writeMarketplace({ functionName: "finalizeBlindAuction", args: [auctionId] });
            alert("已结算盲拍，NFT 将转移给最高出价者");
            refetch();
        } catch (e) {
            console.error(e);
            alert("结算失败，请重试");
        } finally {
            setPendingId("");
        }
    };

    if (!address) return null;

    return (
        <div className="flex justify-center px-4 pb-12">
            <div className="w-full max-w-7xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">我的盲拍</h2>
                    <button className="btn btn-ghost btn-sm" onClick={() => refetch()}>刷新</button>
                </div>

                {isLoadingAuctions ? (
                    <div className="flex items-center gap-2"><span className="loading loading-spinner loading-sm"></span> 加载中...</div>
                ) : auctions.length === 0 ? (
                    <div className="alert alert-info">您没有进行中的盲拍</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {auctions.map(a => {
                            const phase = a.finalized
                                ? "已结束"
                                : now < Number(a.commitEndTime)
                                    ? "提交期"
                                    : now < Number(a.revealEndTime)
                                        ? "揭示期"
                                        : "待结算";
                            const key = a.id.toString();
                            const meta = nftMetas[a.tokenId.toString()];
                            return (
                                <div key={key} className="card bg-base-100 border border-base-300">
                                    {/* 图片区 */}
                                    <figure className="relative overflow-hidden">
                                        {meta?.image ? (
                                            <img
                                                src={meta.image}
                                                alt={meta?.name || `NFT #${a.tokenId.toString()}`}
                                                className="h-64 w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-64 w-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                                <span className="text-4xl">🖼️</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                        <figcaption className="absolute bottom-3 left-3 bg-black/60 text-white px-3 py-1 rounded">
                                            <span className="font-bold">#{a.tokenId.toString()}</span>
                                        </figcaption>
                                    </figure>

                                    <div className="card-body">
                                        <div className="flex items-center justify-between">
                                            <div className="font-semibold">拍卖 #{key}</div>
                                            <div className="badge badge-outline">{phase}</div>
                                        </div>
                                        {/* 名称与基本信息 */}
                                        <div className="text-sm opacity-70">NFT: <Address address={a.nftAddress} size="sm" /> · Token #{a.tokenId.toString()}</div>
                                        {meta?.name && (
                                            <div className="text-sm font-semibold">{meta.name}</div>
                                        )}
                                        <div className="text-sm">最低出价: {Number(a.minBid) / 1e18} ETH</div>
                                        <div className="text-xs opacity-60">提交截止: {formatTime(a.commitEndTime)}</div>
                                        <div className="text-xs opacity-60">揭示截止: {formatTime(a.revealEndTime)}</div>

                                        {phase === "待结算" && (
                                            <div className="mt-3">
                                                <div className="text-sm mb-2 font-medium text-success">
                                                    当前最高有效出价: {Number(a.highestBid || 0n) / 1e18} ETH
                                                </div>
                                                <button className="btn btn-accent btn-sm w-full" disabled={pendingId === key} onClick={() => onFinalize(a.id)}>
                                                    {pendingId === key ? (<span className="loading loading-spinner loading-xs"></span>) : "结算盲拍"}
                                                </button>
                                            </div>
                                        )}

                                        {a.finalized && (
                                            <div className="mt-3 text-sm">
                                                {a.winner ? (
                                                    <span>胜者：<Address address={a.winner} size="sm" /> · 最高出价：{(Number(a.highestBid || 0n) / 1e18)} ETH</span>
                                                ) : (
                                                    <span>未揭示有效出价或无人参与</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
