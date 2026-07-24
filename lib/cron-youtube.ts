import { getSupabaseAdmin } from "./supabase";
import { searchYoutubeTrending } from "./youtube";
import { summarizeVideo } from "./claude";

const DAILY_TARGET = 10;
// 5 个关键词 × 每个最多 10 条 = 候选池上限约 50 条，全部取回后再去重
const CANDIDATE_POOL = 50;

export interface CronResult {
  inserted: number;
  reason?: string;
}

// maxPerRun 限制单次抓取条数，用于 Netlify 定时函数（单次执行有时限），
// 分多次在时间窗内凑够当天名额；不传则一次抓满剩余名额（如 Vercel/手动触发）。
export async function runYoutubeCron(options?: { maxPerRun?: number }): Promise<CronResult> {
  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);

  const { count } = await supabase
    .from("videos")
    .select("id", { count: "exact", head: true })
    .eq("collected_date", today)
    .eq("status", "active");

  const remaining = Math.max(0, DAILY_TARGET - (count ?? 0));
  if (remaining === 0) {
    return { inserted: 0, reason: "今日名额已满" };
  }

  const batchSize = Math.min(remaining, options?.maxPerRun ?? remaining);

  const { data: existing } = await supabase.from("videos").select("url");
  const existingUrls = new Set((existing ?? []).map((row) => row.url));

  // 必须先取回完整候选池再去重：searchYoutubeTrending 会按播放量排序后截断，
  // 若只取 remaining*2 条，这几条往往正是之前已收录的，去重后就一条不剩了。
  const candidates = (await searchYoutubeTrending(CANDIDATE_POOL)).filter(
    (c) => !existingUrls.has(c.url),
  );

  const toInsert = candidates.slice(0, batchSize);
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

  return { inserted: results.length };
}
