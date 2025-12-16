import { getNFTMetadataFromIPFS } from "~~/utils/simpleNFT/ipfs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    let body;
    try {
      const text = await request.text();
      if (!text) {
        return NextResponse.json({ error: "Empty body" }, { status: 400 });
      }
      body = JSON.parse(text);
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { ipfsHash } = body;

    if (!ipfsHash || typeof ipfsHash !== "string") {
      return NextResponse.json(
        { error: "ipfsHash is required and must be a string" },
        { status: 400 }
      );
    }

    const res = await getNFTMetadataFromIPFS(ipfsHash);
    return NextResponse.json(res);
  } catch (error: any) {
    // 将已知错误类型映射到适当的HTTP状态码
    const message = error?.message || "从IPFS获取元数据错误";
    let status = 500;

    if (error?.name === "AbortError") {
      status = 504; // gateway timeout
    } else if (typeof message === "string" && message.startsWith("HTTP ")) {
      const match = message.match(/^HTTP\s+(\d{3})/);
      if (match) {
        status = parseInt(match[1], 10);
      }
    } else if (message.includes("Invalid IPFS hash/CID")) {
      status = 400;
    }

    console.error("从IPFS获取元数据错误", error);
    return NextResponse.json({ error: message }, { status });
  }
}
