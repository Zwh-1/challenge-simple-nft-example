"use client";

import { lazy, useEffect, useState } from "react";
import type { NextPage } from "next";
import { notification } from "~~/utils/scaffold-eth";
import { addToIPFS } from "~~/utils/simpleNFT/ipfs-fetch";
import nftsMetadata from "~~/utils/simpleNFT/nftsMetadata";

const LazyReactJson = lazy(() => import("react-json-view"));

const IpfsUpload: NextPage = () => {
  const [yourJSON, setYourJSON] = useState<object>(nftsMetadata[0]);
  const [loading, setLoading] = useState(false);
  const [uploadedIpfsPath, setUploadedIpfsPath] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleIpfsUpload = async () => {
    setLoading(true);
    const notificationId = notification.loading("Uploading to IPFS...");
    try {
      const uploadedItem = await addToIPFS(yourJSON);
      notification.remove(notificationId);
      notification.success("Uploaded to IPFS");

      setUploadedIpfsPath(uploadedItem.path);
    } catch (error) {
      notification.remove(notificationId);
      notification.error("Error uploading to IPFS");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl bg-base-100/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-base-content/10 p-8 sm:p-12 animate-fade-in-up">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold tracking-tight text-white mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Upload to IPFS
            </span>
          </h1>
          <p className="text-lg text-gray-300">Create and upload your NFT metadata to the decentralized web.</p>
        </div>

        <div className="bg-base-300/50 rounded-xl p-6 border border-base-content/5 shadow-inner">
          {mounted && (
            <LazyReactJson
              style={{ padding: "1rem", borderRadius: "0.75rem", backgroundColor: "transparent" }}
              src={yourJSON}
              theme="ocean"
              enableClipboard={false}
              onEdit={edit => {
                setYourJSON(edit.updated_src);
              }}
              onAdd={add => {
                setYourJSON(add.updated_src);
              }}
              onDelete={del => {
                setYourJSON(del.updated_src);
              }}
            />
          )}
        </div>

        <div className="mt-10 flex justify-center">
          <button
            className={`btn btn-primary btn-lg px-10 rounded-full font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-600 border-none hover:shadow-lg hover:scale-105 transition-all duration-300 ${
              loading ? "loading" : ""
            }`}
            disabled={loading}
            onClick={handleIpfsUpload}
          >
            {loading ? "Uploading..." : "Upload to IPFS"}
          </button>
        </div>

        {uploadedIpfsPath && (
          <div className="mt-10 p-6 bg-green-500/10 border border-green-500/20 rounded-xl animate-fade-in-up">
            <div className="flex flex-col items-center text-center">
              <span className="text-green-400 font-semibold mb-2">Upload Successful!</span>
              <a
                href={`https://gateway.pinata.cloud/ipfs/${uploadedIpfsPath}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 underline break-all transition-colors"
              >
                {`https://gateway.pinata.cloud/ipfs/${uploadedIpfsPath}`}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IpfsUpload;
