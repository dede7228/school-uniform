import { NextRequest, NextResponse } from "next/server";
import { runYoutubeCron } from "@/lib/cron-youtube";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const result = await runYoutubeCron();
  return NextResponse.json(result);
}
