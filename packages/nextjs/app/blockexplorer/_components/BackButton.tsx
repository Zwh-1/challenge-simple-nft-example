"use client";

import { useRouter } from "next/navigation";

export const BackButton = () => {
  const router = useRouter();
  return (
    <button className="btn btn-sm btn-primary" onClick={() => router.back()}>
      返回
    </button>
  );
};
