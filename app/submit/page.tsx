"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Platform } from "@/lib/types";
import { PLATFORM_LABEL } from "@/lib/types";

const MANUAL_PLATFORMS: Platform[] = ["douyin", "video_account"];

export default function SubmitPage() {
  const router = useRouter();
  const [platform, setPlatform] = useState<Platform>("douyin");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const stats = {
      views: Number(form.get("views")) || undefined,
      likes: Number(form.get("likes")) || undefined,
      comments: Number(form.get("comments")) || undefined,
    };

    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          url: form.get("url"),
          title: form.get("title"),
          author: form.get("author"),
          contentNote: form.get("contentNote"),
          submittedBy: form.get("submittedBy"),
          stats,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "提交失败");
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-xl">
        <Link href="/" className="text-sm text-neutral-400 hover:text-white">
          ← 返回看板
        </Link>
        <h1 className="mt-2 mb-1 text-xl font-semibold">手动录入视频</h1>
        <p className="mb-6 text-sm text-neutral-400">
          用于抖音/视频号：粘贴链接并简要描述视频内容，AI 会自动生成创意拆解。内容描述写得越具体，拆解质量越好。
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-neutral-300">平台</label>
            <div className="flex gap-2">
              {MANUAL_PLATFORMS.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    platform === p ? "bg-white text-black" : "border border-neutral-700 text-neutral-300"
                  }`}
                >
                  {PLATFORM_LABEL[p]}
                </button>
              ))}
            </div>
          </div>

          <Field label="视频链接" name="url" required placeholder="https://..." />
          <Field label="标题" name="title" required placeholder="视频标题/文案标题" />
          <Field label="账号名称" name="author" placeholder="例如：青青世界校服" />

          <div>
            <label className="mb-1 block text-sm text-neutral-300">内容简述 / 文案脚本</label>
            <textarea
              name="contentNote"
              rows={5}
              required
              placeholder="描述视频画面/节奏/文案，例如：开头3秒用反差穿搭对比抓人，中间展示面料细节...这段内容会直接喂给AI做拆解"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="播放量" name="views" type="number" placeholder="0" />
            <Field label="点赞数" name="likes" type="number" placeholder="0" />
            <Field label="评论数" name="comments" type="number" placeholder="0" />
          </div>

          <Field label="录入人" name="submittedBy" placeholder="你的名字" />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 px-3 py-2.5 font-medium hover:bg-indigo-500 disabled:opacity-50"
          >
            {submitting ? "AI 拆解生成中…" : "提交并生成创意拆解"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-neutral-300">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-indigo-500"
      />
    </div>
  );
}
