import type { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const raw = slug || "team";
  const base = raw.replace(/\.(svg|png)$/i, "");
  const abbr =
    base
      .replace(/[^A-Za-z0-9\u4e00-\u9fa5 ]/g, " ")
      .trim()
      .split(/\s+/)
      .map(w => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase() || "TEAM";

  const bg = "#e1faff"; // align with light theme base-200
  const stroke = "#c8f5ff"; // base-300
  const text = "#026262"; // primary-content

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <defs>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#00000033"/>
    </filter>
  </defs>
  <g filter="url(#shadow)">
    <circle cx="32" cy="32" r="28" fill="${bg}" stroke="${stroke}" stroke-width="2" />
    <text x="32" y="38" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700" text-anchor="middle" fill="${text}">${abbr}</text>
  </g>
</svg>`;

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
