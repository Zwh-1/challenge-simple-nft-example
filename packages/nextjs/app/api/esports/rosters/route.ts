import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const key = url.searchParams.get("league") || "LCK";
  const data = {
    league: { key, label: key },
    rostersByTeam: {} as Record<string, { role: "上" | "野" | "中" | "下" | "辅"; player: string }[]>,
    subsByTeam: {} as Record<string, string[]>,
  };
  return NextResponse.json({ data }, { status: 200 });
}