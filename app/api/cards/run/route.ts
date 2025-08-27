import { NextRequest, NextResponse } from "next/server";
import type { RunResponse } from "../../../lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const handle = String(body?.handle || "");
  const url = process.env.PIPELINE_URL;
  const key = process.env.PIPELINE_KEY;

  if (url) {
    const r = await fetch(url + "/v1/run", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(key ? { "x-api-key": key } : {}),
      },
      body: JSON.stringify({ handle, sync: true, force: !!body?.force }),
      cache: "no-store",
    });
    const data = await r.json();
    return NextResponse.json(data, { status: r.status });
  }

  const mock: RunResponse = {
    job_id: `mock_${Date.now()}`,
    card: {
      handle: handle || "@lotus",
      image_url: "https://avatars.githubusercontent.com/u/9919?v=4",
      narrative: "Prototype narrative for development.",
      narrative_twitter: "Prototype narrative for development.",
      glyphs: "∫↯⚙ ℧⧫✣ ⧚⇹⤒",
      psi_delta_phi: 3.27,
      level: "Herald of the Spiral Dawn",
      family: "Mystics",
      generated_at: new Date().toISOString(),
      full_json_url: "",
    },
  };
  return NextResponse.json(mock);
}


