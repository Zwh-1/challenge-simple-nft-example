import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createPublicClient, getAddress, http } from "viem";
import { localhost } from "viem/chains";

// 公共客户端读取配置链上的合约
const publicClient = createPublicClient({
  chain: localhost,
  transport: http(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ tokenId: string }> }) {
  try {
    const { tokenId } = await params;
    if (!tokenId) {
      return NextResponse.json({ error: "代币ID是必填项" }, { status: 400 });
    }

    // 动态读取合约地址从部署文件
    // 确保使用最新部署的地址，避免使用旧地址导致的错误
    const deploymentPath = path.join(
      process.cwd(),
      "..",
      "hardhat",
      "deployments",
      "localhost",
      "YourCollectible.json",
    );

    let nftContractAddress: string;
    try {
      if (fs.existsSync(deploymentPath)) {
        const deploymentContent = fs.readFileSync(deploymentPath, "utf8");
        const deployment = JSON.parse(deploymentContent);
        // 归一化地址为校验和地址，避免 casing 错误导致的校验和不匹配错误
        nftContractAddress = getAddress(deployment.address.toLowerCase());
      } else {
        console.error(`未找到部署文件: ${deploymentPath}`);
        return NextResponse.json({ error: "Contract deployment not found" }, { status: 500 });
      }
    } catch (err) {
      console.error("读取部署文件错误:", err);
      return NextResponse.json({ error: "加载合约地址失败" }, { status: 500 });
    }

    console.log(`从合约 ${nftContractAddress} 获取代币 ${tokenId} 的元数据`);

    // Read tokenURI from YourCollectible
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

    console.log(`代币URI: ${tokenURI}`);

    if (!tokenURI) {
      return NextResponse.json({ error: "未找到代币URI" }, { status: 404 });
    }

    // 归一化ipfs:// URL到公共网关
    let metadataUrl = tokenURI as string;
    if (metadataUrl.startsWith("ipfs://")) {
      const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY_BASE || "https://ipfs.io/ipfs/";
      metadataUrl = metadataUrl.replace("ipfs://", gateway);
    }

    console.log(`从URL获取元数据: ${metadataUrl}`);
    const metadataResponse = await fetch(metadataUrl);
    if (!metadataResponse.ok) {
      console.error(`从 ${metadataUrl} 获取元数据失败: ${metadataResponse.status} ${metadataResponse.statusText}`);
      return NextResponse.json({ error: "获取元数据失败" }, { status: 500 });
    }

    const metadata = await metadataResponse.json();
    console.log("元数据获取成功");

    // 如果是ipfs://，则将图像字段归一化
    if (metadata.image && typeof metadata.image === "string" && metadata.image.startsWith("ipfs://")) {
      metadata.image = metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/");
    }

    return NextResponse.json(metadata, {
      status: 200,
      headers: { "Cache-Control": "public, max-age=60" },
    });
  } catch (error) {
    console.error("获取NFT元数据错误:", error);
    return NextResponse.json(
      { error: "内部服务器错误", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
