import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center h-full flex-1 justify-center bg-base-200">
      <div className="text-center">
        <h1 className="text-6xl font-bold m-0 mb-1">404</h1>
        <h2 className="text-2xl font-semibold m-0">页面未找到</h2>
        <p className="text-base-content/70 m-0 mb-4">你正在寻找的页面不存在。</p>
        <Link href="/" className="btn btn-primary">
          回到首页
        </Link>
      </div>
    </div>
  );
}
