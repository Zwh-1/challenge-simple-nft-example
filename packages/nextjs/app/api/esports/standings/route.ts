import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const key = url.searchParams.get("league") || "LCK";
  const data = {
    league: { key, label: key },
    rankings: [] as Array<{ name: string; slug?: string; code?: string; image?: string; wins?: number; losses?: number }>,
  };
  return NextResponse.json({ data }, { status: 200 });
}