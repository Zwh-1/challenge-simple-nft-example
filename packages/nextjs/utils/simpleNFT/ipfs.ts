// Pinata API configuration
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || "0x0";
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY || "0x0";
// Pinata API client for uploading to IPFS
export const ipfsClient = {
  async add(content: string) {
    try {
      const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
        body: JSON.stringify({
          pinataContent: JSON.parse(content),
          pinataMetadata: {
            name: "NFT Metadata",
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { path: result.IpfsHash };
    } catch (error) {
      console.error("上传到Pinata错误:", error);
      throw error;
    }
  },
  async addFile(formData: FormData) {
    try {
      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { path: result.IpfsHash };
    } catch (error) {
      console.error("上传文件到Pinata错误:", error);
      throw error;
    }
  },
};

// Normalize various IPFS formats to a bare CID
function normalizeIpfsHash(input: string): string {
  if (!input) return "";
  let cid = input.trim();
  // ipfs://CID or ipfs://ipfs/CID
  cid = cid.replace(/^ipfs:\/\//i, "");
  cid = cid.replace(/^ipfs\//i, "");
  // Extract from full gateway URL
  const ipfsIndex = cid.indexOf("/ipfs/");
  if (ipfsIndex !== -1) {
    cid = cid.substring(ipfsIndex + 6);
  }
  // Remove leading slashes
  cid = cid.replace(/^\/+/, "");
  // If URL with query params, strip after CID path segment
  const qIndex = cid.indexOf("?");
  if (qIndex !== -1) {
    cid = cid.substring(0, qIndex);
  }
  return cid;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithTimeout(url: string, ms = 10000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function getNFTMetadataFromIPFS(ipfsHash: string) {
  const cid = normalizeIpfsHash(ipfsHash);
  if (!cid) {
    throw new Error("Invalid IPFS hash/CID");
  }

  const gateways = [
    `https://ipfs.io/ipfs/${cid}`,
    `https://dweb.link/ipfs/${cid}`,
    `https://gateway.pinata.cloud/ipfs/${cid}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}`,
  ];

  let lastError: any = null;

  for (const url of gateways) {
    try {
      // Add a small random delay to avoid hitting rate limits simultaneously
      await sleep(Math.floor(Math.random() * 500));

      const response = await fetchWithTimeout(url, 10000);

      if (response.status === 429) {
        // If rate limited, wait longer and try next gateway
        console.warn(`Rate limited at ${url}, waiting...`);
        await sleep(2000);
        lastError = new Error(`HTTP 429 Too Many Requests at ${url}`);
        continue;
      }

      if (!response.ok) {
        lastError = new Error(`HTTP ${response.status} ${response.statusText} at ${url}`);
        continue;
      }

      const jsonObject = await response.json();

      // Sanitize image URL if it points to a restricted gateway
      if (jsonObject.image && typeof jsonObject.image === "string") {
        const image = jsonObject.image;
        const isIpfsScheme = image.startsWith("ipfs://");
        const isIpfsPath = image.includes("/ipfs/");

        // Only rewrite if it's clearly an IPFS resource
        if (isIpfsScheme || isIpfsPath) {
          const imgCid = normalizeIpfsHash(image);
          if (imgCid) {
            // Use ipfs.io as a fallback
            jsonObject.image = `https://ipfs.io/ipfs/${imgCid}`;
          }
        }
      }

      return jsonObject;
    } catch (err) {
      lastError = err;
      // Continue to next gateway
    }
  }

  if (lastError) {
    throw lastError;
  }
  throw new Error("Failed to fetch IPFS metadata from all gateways");
}
