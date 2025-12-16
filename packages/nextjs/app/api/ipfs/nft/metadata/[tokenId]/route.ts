import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";

// 创建公共客户端来读取合约
const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params;

    if (!tokenId) {
      return NextResponse.json({ error: "Token ID is required" }, { status: 400 });
    }

    // 获取NFT合约地址
    const nftContractAddress = process.env.NEXT_PUBLIC_YOUR_COLLECTIBLE_ADDRESS;
    if (!nftContractAddress) {
      return NextResponse.json({ error: "NFT合约地址未配置" }, { status: 500 });
    }
    if (!/^0x[0-9a-fA-F]{40}$/.test(String(nftContractAddress))) {
      return NextResponse.json({ error: "无效的合约地址" }, { status: 500 });
    }

    // 从 YourCollectible 合约获取 tokenURI
    const tokenURI = await publicClient.readContract({
      address: nftContractAddress as `0x${string}`,
      abi: [
        {
          inputs: [{ name: "tokenId", type: "uint256" }],
          name: "tokenURI",
          outputs: [{ name: "", type: "string" }],
          stateMutability: "view",
          type: "function",
        },
      ],
      functionName: "tokenURI",
      args: [BigInt(tokenId)],
    });

    if (!tokenURI) {
      return NextResponse.json({ error: "Token URI not found" }, { status: 404 });
    }

    // 如果是 IPFS URL，转换为可访问的 URL
    let metadataUrl = tokenURI as string;
    if (metadataUrl.startsWith("ipfs://")) {
      const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY_BASE || "https://gateway.pinata.cloud/ipfs/";
      metadataUrl = metadataUrl.replace("ipfs://", gateway);
    }

    // 获取元数据
    const metadataResponse = await fetch(metadataUrl);
    if (!metadataResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 });
    }

    const metadata = await metadataResponse.json();

    // 如果图片是 IPFS URL，也转换一下
    if (metadata.image && metadata.image.startsWith("ipfs://")) {
      const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY_BASE || "https://gateway.pinata.cloud/ipfs/";
      metadata.image = metadata.image.replace("ipfs://", gateway);
    }

    return NextResponse.json(metadata, {
      status: 200,
      headers: { "Cache-Control": "public, max-age=60" },
    });
  } catch (error) {
    console.error("获取NFT元数据错误:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}