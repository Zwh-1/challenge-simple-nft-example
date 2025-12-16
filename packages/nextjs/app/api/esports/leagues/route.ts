import { NextResponse } from "next/server";

export async function GET() {
  // 返回空数组即可触发前端的静态回退数据
  return NextResponse.json({ data: [] }, { status: 200 });
}