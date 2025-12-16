/* eslint-disable prettier/prettier */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

/**
 * @dev 自定义NFT铸造组件
 */
export const CustomNFTMinter = () => {
  // 状态管理
  const { address: connectedAddress } = useAccount();
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // 选中的文件
  const [previewUrl, setPreviewUrl] = useState<string>(""); // 本地文件预览URL
  const [nftName, setNftName] = useState<string>(""); // NFT名称
  const [nftDescription, setNftDescription] = useState<string>(""); // NFT描述
  const [isUploading, setIsUploading] = useState(false); // 是否正在上传
  const [isMinting, setIsMinting] = useState(false); // 是否正在铸造
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>(""); // IPFS上的图片URL

  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "YourCollectible" });

  /**
   * @dev 处理文件选择
   * @param event 文件选择事件
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  /**
   * @dev 将图片上传到IPFS
   */
  const uploadImageToPinata = async () => {
    if (!selectedFile) {
      notification.error("请先选择一张图片");
      return;
    }

    setIsUploading(true);
    const notificationId = notification.loading("正在上传图片到IPFS...");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/ipfs/upload-image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadedImageUrl(result.imageUrl);
        notification.remove(notificationId);
        notification.success("图片上传到IPFS成功!");
      } else {
        throw new Error(result.error || "上传失败");
      }
    } catch (error) {
      notification.remove(notificationId);
      notification.error("上传图片到IPFS失败");
      console.error("上传错误:", error);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * @dev 铸造自定义NFT
   */
  const mintCustomNFT = async () => {
    if (!uploadedImageUrl || !nftName.trim()) {
      notification.error("请上传图片并提供名称");
      return;
    }

    setIsMinting(true);
    const notificationId = notification.loading("正在创建NFT元数据并铸造...");

    try {
      // 创建NFT元数据
      const metadataResponse = await fetch("/api/ipfs/create-nft-metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: uploadedImageUrl,
          name: nftName,
          description: nftDescription || `自定义NFT: ${nftName}`,
          attributes: [
            {
              trait_type: "Type",
              value: "Custom Upload",
            },
            {
              trait_type: "Created",
              value: new Date().toISOString().split("T")[0],
            },
          ],
        }),
      });

      const metadataResult = await metadataResponse.json();

      if (!metadataResult.success) {
        throw new Error(metadataResult.error || "创建元数据失败");
      }

      // 铸造NFT
      await writeContractAsync({
        functionName: "mintItem",
        args: [connectedAddress, metadataResult.metadataHash],
      });

      notification.remove(notificationId);
      notification.success("自定义NFT铸造成功!");

      // 重置表单
      setSelectedFile(null);
      setPreviewUrl("");
      setNftName("");
      setNftDescription("");
      setUploadedImageUrl("");
    } catch (error) {
      notification.remove(notificationId);
      notification.error("铸造自定义NFT失败");
      console.error("铸造错误:", error);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl w-full max-w-md mx-auto">
      <div className="card-body">
        <h2 className="card-title text-center">创建自定义NFT</h2>

        {/* 文件上传 */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">上传图片</span>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="file-input file-input-bordered w-full"
          />
        </div>

        {/* 图片预览 */}
        {previewUrl && (
          <div className="mt-4">
            <img src={previewUrl} alt="预览" className="w-full h-48 object-cover rounded-lg border" />
          </div>
        )}

        {/* 上传按钮 */}
        {selectedFile && !uploadedImageUrl && (
          <button className="btn btn-primary mt-4" onClick={uploadImageToPinata} disabled={isUploading}>
            {isUploading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                正在上传到IPFS...
              </>
            ) : (
              "上传到IPFS"
            )}
          </button>
        )}

        {/* 上传成功消息 */}
        {uploadedImageUrl && (
          <div className="alert alert-success mt-4">
            <span>✓ 图片上传到IPFS成功!</span>
          </div>
        )}

        {/* NFT详情表单 */}
        {uploadedImageUrl && (
          <>
            <div className="form-control w-full mt-4">
              <label className="label">
                <span className="label-text">NFT名称 *</span>
              </label>
              <input
                type="text"
                placeholder="输入NFT名称"
                className="input input-bordered w-full"
                value={nftName}
                onChange={e => setNftName(e.target.value)}
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">描述 (可选)</span>
              </label>
              <textarea
                placeholder="输入NFT描述"
                className="textarea textarea-bordered w-full"
                value={nftDescription}
                onChange={e => setNftDescription(e.target.value)}
              />
            </div>

            {/* 铸造按钮 */}
            <button className="btn btn-secondary mt-4" onClick={mintCustomNFT} disabled={isMinting || !nftName.trim()}>
              {isMinting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  正在铸造NFT...
                </>
              ) : (
                "铸造自定义NFT"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
