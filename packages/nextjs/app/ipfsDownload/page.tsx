"use client";

import { lazy, useEffect, useState } from "react";
import type { NextPage } from "next";
import { notification } from "~~/utils/scaffold-eth";
import { getMetadataFromIPFS } from "~~/utils/simpleNFT/ipfs-fetch";

const LazyReactJson = lazy(() => import("react-json-view"));

const IpfsDownload: NextPage = () => {
  const [yourJSON, setYourJSON] = useState({});
  const [ipfsPath, setIpfsPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleIpfsDownload = async () => {
    setLoading(true);
    const notificationId = notification.loading("Getting data from IPFS");
    try {
      const metaData = await getMetadataFromIPFS(ipfsPath);
      notification.remove(notificationId);
      notification.success("Downloaded from IPFS");

      setYourJSON(metaData);
    } catch (error) {
      notification.remove(notificationId);
      notification.error("Error downloading from IPFS");
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
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
              从 IPFS 下载
            </span>
          </h1>
          <p className="text-lg text-gray-300">
            直接从去中心化网络检索和查看 NFT 元数据。
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="w-full max-w-lg relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">ipfs://</span>
            </div>
            <input
              className="input input-lg w-full pl-16 pr-4 bg-base-200/50 border-base-content/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 rounded-full text-base-content placeholder:text-base-content/40 transition-all duration-300"
              placeholder="Enter IPFS CID (e.g., Qm...)"
              value={ipfsPath}
              onChange={e => setIpfsPath(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="flex justify-center mb-10">
          <button
            className={`btn btn-primary btn-lg px-10 rounded-full font-bold text-lg bg-gradient-to-r from-cyan-500 to-blue-600 border-none hover:shadow-lg hover:scale-105 transition-all duration-300 ${loading ? "loading" : ""
              }`}
            disabled={loading}
            onClick={handleIpfsDownload}
          >
            {loading ? "Downloading..." : "Download Data"}
          </button>
        </div>

        <div className="bg-base-300/50 rounded-xl p-6 border border-base-content/5 shadow-inner min-h-[200px]">
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
      </div>
    </div>
  );
};

export default IpfsDownload;
