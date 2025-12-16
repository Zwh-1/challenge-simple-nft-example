import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const key = url.searchParams.get("league") || "LCK";
  // 结构与前端契约一致：data.nextByTeam
  const data = {
    league: { key, label: key },
    nextByTeam: {} as Record<string, { opponent: string; startTime: string }>,
  };
  return NextResponse.json({ data }, { status: 200 });
}