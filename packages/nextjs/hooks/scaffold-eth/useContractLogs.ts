import { useEffect, useState } from "react";
import { useTargetNetwork } from "./useTargetNetwork";
import { Address, Log } from "viem";
import { usePublicClient } from "wagmi";

export const useContractLogs = (address: Address) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const { targetNetwork } = useTargetNetwork();
  const client = usePublicClient({ chainId: targetNetwork.id });

  useEffect(() => {
    const fetchLogs = async () => {
      if (!client) return console.error("未找到客户端");
      try {
        const existingLogs = await client.getLogs({
          address: address,
          fromBlock: 0n,
          toBlock: "latest",
        });
        setLogs(existingLogs);
      } catch (error) {
        console.error("获取日志失败:", error);
      }
    };
    fetchLogs();

    return client?.watchBlockNumber({
      onBlockNumber: async (_blockNumber, prevBlockNumber) => {
        const newLogs = await client.getLogs({
          address: address,
          fromBlock: prevBlockNumber,
          toBlock: "latest",
        });
        setLogs(prevLogs => [...prevLogs, ...newLogs]);
      },
    });
  }, [address, client]);

  return logs;
};
