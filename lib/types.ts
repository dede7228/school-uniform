export type Platform = "douyin" | "video_account" | "youtube";
export type SourceType = "auto" | "manual";

export interface VideoStats {
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
}

export interface AiSummary {
  hook: string;
  structure: string;
  creative_angle: string;
  applicable_ideas: string;
  one_line: string;
}

export interface VideoEntry {
  id: string;
  platform: Platform;
  source_type: SourceType;
  url: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  stats: VideoStats | null;
  content_note: string | null;
  ai_summary: AiSummary | null;
  status: "active" | "archived";
  is_favorite: boolean;
  submitted_by: string | null;
  published_at: string | null;
  collected_date: string;
  created_at: string;
}

export const PLATFORM_LABEL: Record<Platform, string> = {
  douyin: "抖音",
  video_account: "视频号",
  youtube: "YouTube",
};
