import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Platform, VideoEntry } from "@/lib/types";
import { PLATFORM_LABEL } from "@/lib/types";
import VideoCard from "@/components/VideoCard";

const DAILY_TARGET = 10;
const PLATFORMS: Platform[] = ["douyin", "video_account", "youtube"];

function shiftDate(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; platform?: string }>;
}) {
  const params = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const date = params.date ?? today;
  const platform = params.platform as Platform | undefined;

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("videos")
    .select("*")
    .eq("status", "active")
    .eq("collected_date", date)
    .order("created_at", { ascending: false });

  if (platform) query = query.eq("platform", platform);

  const { data: videos } = await query;
  const list = (videos ?? []) as VideoEntry[];

  const buildHref = (overrides: { date?: string; platform?: string | null }) => {
    const p = new URLSearchParams();
    p.set("date", overrides.date ?? date);
    const nextPlatform = overrides.platform === undefined ? platform : overrides.platform;
    if (nextPlatform) p.set("platform", nextPlatform);
    return `/?${p.toString()}`;
  };

  return (
    <div className="min-h-screen bg-neutral-950 pb-16 text-white">
      <header className="border-b border-neutral-800 bg-neutral-950/80 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold">校服行业创意库</h1>
            <p className="text-sm text-neutral-400">对标：青青世界校服 · 每日精选爆款视频拆解</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-neutral-700 px-3 py-1 text-sm">
              今日 {list.length}/{DAILY_TARGET}
            </span>
            <Link
              href="/submit"
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium hover:bg-indigo-500"
            >
              + 手动录入
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link href={buildHref({ date: shiftDate(date, -1) })} className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800">
              ← 前一天
            </Link>
            <span className="rounded-lg bg-neutral-800 px-3 py-1.5 text-sm">{date}</span>
            <Link href={buildHref({ date: shiftDate(date, 1) })} className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800">
              后一天 →
            </Link>
            {date !== today && (
              <Link href={buildHref({ date: today })} className="text-sm text-indigo-400 hover:underline">
                回到今天
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={buildHref({ platform: null })}
              className={`rounded-full px-3 py-1.5 text-sm ${!platform ? "bg-white text-black" : "border border-neutral-700"}`}
            >
              全部
            </Link>
            {PLATFORMS.map((p) => (
              <Link
                key={p}
                href={buildHref({ platform: p })}
                className={`rounded-full px-3 py-1.5 text-sm ${platform === p ? "bg-white text-black" : "border border-neutral-700"}`}
              >
                {PLATFORM_LABEL[p]}
              </Link>
            ))}
          </div>
        </div>

        {list.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-800 p-12 text-center text-neutral-500">
            这一天还没有创意库内容。抖音/视频号内容需要编辑手动录入，YouTube 每天会自动抓取。
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
