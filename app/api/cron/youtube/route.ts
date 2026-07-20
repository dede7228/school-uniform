import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { searchYoutubeTrending } from "@/lib/youtube";
import { summarizeVideo } from "@/lib/claude";

export const maxDuration = 60;

const DAILY_TARGET = 10;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);

  const { count } = await supabase
    .from("videos")
    .select("id", { count: "exact", head: true })
    .eq("collected_date", today)
    .eq("status", "active");

  const remaining = Math.max(0, DAILY_TARGET - (count ?? 0));
  if (remaining === 0) {
    return NextResponse.json({ inserted: 0, reason: "今日名额已满" });
  }

  const { data: existing } = await supabase.from("videos").select("url");
  const existingUrls = new Set((existing ?? []).map((row) => row.url));

  const candidates = (await searchYoutubeTrending(remaining * 2)).filter(
    (c) => !existingUrls.has(c.url),
  );

  const toInsert = candidates.slice(0, remaining);
  const results = [];

  for (const candidate of toInsert) {
    try {
      const aiSummary = await summarizeVideo({
        platform: "youtube",
        title: candidate.title,
        author: candidate.channelTitle,
        contentNote: candidate.description,
        stats: {
          views: candidate.viewCount,
          likes: candidate.likeCount,
          comments: candidate.commentCount,
        },
      });

      const { data, error } = await supabase
        .from("videos")
        .insert({
          platform: "youtube",
          source_type: "auto",
          url: candidate.url,
          title: candidate.title,
          author: candidate.channelTitle,
          cover_url: candidate.thumbnailUrl,
          stats: {
            views: candidate.viewCount,
            likes: candidate.likeCount,
            comments: candidate.commentCount,
          },
          content_note: candidate.description,
          ai_summary: aiSummary,
          published_at: candidate.publishedAt,
          collected_date: today,
        })
        .select()
        .single();

      if (error) throw error;
      results.push(data);
    } catch (err) {
      console.error("youtube cron insert failed", candidate.url, err);
    }
  }

  return NextResponse.json({ inserted: results.length });
}
