import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { summarizeVideo } from "@/lib/claude";
import type { Platform } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const platform = searchParams.get("platform");

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("videos")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (date) query = query.eq("collected_date", date);
  if (platform) query = query.eq("platform", platform);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ videos: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { platform, url, title, author, contentNote, stats, submittedBy } = body as {
    platform: Platform;
    url: string;
    title: string;
    author?: string;
    contentNote?: string;
    stats?: Record<string, unknown>;
    submittedBy?: string;
  };

  if (!platform || !url || !title) {
    return NextResponse.json({ error: "platform, url, title 为必填" }, { status: 400 });
  }

  let aiSummary;
  try {
    aiSummary = await summarizeVideo({ platform, title, author, contentNote, stats });
  } catch (err) {
    return NextResponse.json(
      { error: `AI 总结失败：${err instanceof Error ? err.message : String(err)}` },
      { status: 502 },
    );
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("videos")
    .insert({
      platform,
      source_type: "manual",
      url,
      title,
      author: author ?? null,
      stats: stats ?? null,
      content_note: contentNote ?? null,
      ai_summary: aiSummary,
      submitted_by: submittedBy ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ video: data }, { status: 201 });
}
