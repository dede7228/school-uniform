import { PLATFORM_LABEL, type Platform } from "@/lib/types";

const COLOR: Record<Platform, string> = {
  douyin: "bg-neutral-800 text-white",
  video_account: "bg-emerald-700 text-white",
  youtube: "bg-red-600 text-white",
};

export default function PlatformBadge({ platform }: { platform: Platform }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${COLOR[platform]}`}>
      {PLATFORM_LABEL[platform]}
    </span>
  );
}
