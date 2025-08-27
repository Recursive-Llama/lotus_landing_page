import { NextRequest, NextResponse } from "next/server";

// Simple pass-through proxy. Replace lookup logic later when scraper is ready.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const handle = String((searchParams.get("handle") || "").replace(/^@/, ""));
  if (!/^[A-Za-z0-9_]{1,15}$/.test(handle)) {
    return new NextResponse("bad handle", { status: 400 });
  }

  // TEMP: use GitHub avatar as placeholder until Twitter lookup exists
  const fallback = "https://avatars.githubusercontent.com/u/583231?v=4";
  const targetUrl = fallback;
  const r = await fetch(targetUrl);
  const buf = Buffer.from(await r.arrayBuffer());
  const res = new NextResponse(buf, { status: 200 });
  res.headers.set("content-type", "image/png");
  res.headers.set("cache-control", "s-maxage=86400, stale-while-revalidate=604800");
  return res;
}


