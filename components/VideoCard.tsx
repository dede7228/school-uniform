"use client";

import { useState } from "react";
import PlatformBadge from "./PlatformBadge";
import type { VideoEntry } from "@/lib/types";

function formatStat(n?: number) {
  if (!n) return "-";
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  return String(n);
}

export default function VideoCard({ video }: { video: VideoEntry }) {
  const [favorite, setFavorite] = useState(video.is_favorite);
  const [pending, setPending] = useState(false);

  async function toggleFavorite() {
    setPending(true);
    const next = !favorite;
    setFavorite(next);
    try {
      await fetch(`/api/videos/${video.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_favorite: next }),
      });
    } finally {
      setPending(false);
    }
  }

  const s = video.stats ?? {};

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
      <div className="relative aspect-video bg-neutral-800">
        {video.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={video.cover_url} alt={video.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-600">无封面</div>
        )}
        <div className="absolute left-2 top-2">
          <PlatformBadge platform={video.platform} />
        </div>
        <button
          onClick={toggleFavorite}
          disabled={pending}
          className={`absolute right-2 top-2 rounded-full px-2 py-1 text-sm ${
            favorite ? "bg-amber-500 text-white" : "bg-black/50 text-white"
          }`}
        >
          {favorite ? "★ 已收藏" : "☆ 收藏"}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <a
          href={video.url}
          target="_blank"
          rel="noreferrer"
          className="line-clamp-2 font-medium text-white hover:text-indigo-400"
        >
          {video.title}
        </a>
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span>{video.author ?? "未知账号"}</span>
          <span>播放 {formatStat(s.views)}</span>
          <span>赞 {formatStat(s.likes)}</span>
          <span>评论 {formatStat(s.comments)}</span>
        </div>

        {video.ai_summary && (
          <div className="mt-2 space-y-1.5 rounded-lg bg-neutral-800/60 p-3 text-sm text-neutral-200">
            <p><span className="text-indigo-400">钩子：</span>{video.ai_summary.hook}</p>
            <p><span className="text-indigo-400">结构：</span>{video.ai_summary.structure}</p>
            <p><span className="text-indigo-400">创意点：</span>{video.ai_summary.creative_angle}</p>
            <p><span className="text-emerald-400">可借鉴：</span>{video.ai_summary.applicable_ideas}</p>
          </div>
        )}

        <span className="mt-auto pt-1 text-xs text-neutral-500">
          {video.source_type === "auto" ? "系统自动抓取" : `人工录入${video.submitted_by ? ` · ${video.submitted_by}` : ""}`}
        </span>
      </div>
    </div>
  );
}
