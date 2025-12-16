"use server";

import { NextRequest } from "next/server";

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || "0x0";
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY || "0x0";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // Create FormData for Pinata
    const pinataFormData = new FormData();
    pinataFormData.append("file", file);

    const pinataMetadata = JSON.stringify({
      name: `NFT_Image_${Date.now()}`,
    });
    pinataFormData.append("pinataMetadata", pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });
    pinataFormData.append("pinataOptions", pinataOptions);

    // Upload to Pinata
    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
      body: pinataFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Pinata上传错误:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return Response.json({
      success: true,
      ipfsHash: result.IpfsHash,
      imageUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
    });
  } catch (error) {
    console.error("上传图片到Pinata错误:", error);
    return Response.json({ error: "上传图片到Pinata错误" }, { status: 500 });
  }
}