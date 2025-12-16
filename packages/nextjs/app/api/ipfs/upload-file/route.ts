import { NextResponse } from "next/server";
import { ipfsClient } from "~~/utils/simpleNFT/ipfs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "未提供文件" }, { status: 400 });
    }

    const res = await ipfsClient.addFile(formData);
    return NextResponse.json(res);
  } catch (error) {
    console.error("上传文件到IPFS错误:", error);
    return NextResponse.json({ error: "上传文件到IPFS错误" }, { status: 500 });
  }
}
