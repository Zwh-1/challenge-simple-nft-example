import { useState } from "react";

export const useCopyToClipboard = () => {
  const [isCopiedToClipboard, setIsCopiedToClipboard] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopiedToClipboard(true);
      setTimeout(() => {
        setIsCopiedToClipboard(false);
      }, 800);
    } catch (err) {
      console.error("复制文本失败:", err);
    }
  };

  return { copyToClipboard, isCopiedToClipboard };
};
