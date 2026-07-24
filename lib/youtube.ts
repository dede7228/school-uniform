export interface YoutubeCandidate {
  videoId: string;
  url: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

const KEYWORDS = [
  "school uniform design",
  "school uniform review",
  "school uniform manufacturer",
  "校服",
  "school uniform fashion",
];

export async function searchYoutubeTrending(limit = 10): Promise<YoutubeCandidate[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing YOUTUBE_API_KEY env var");
  }

  const publishedAfter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const idSet = new Set<string>();

  // 并行搜索：定时函数单次执行有时限，串行 5 次会白白多花几秒
  const searches = await Promise.all(
    KEYWORDS.map(async (keyword) => {
      const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
      searchUrl.searchParams.set("key", apiKey);
      searchUrl.searchParams.set("part", "snippet");
      searchUrl.searchParams.set("type", "video");
      searchUrl.searchParams.set("order", "viewCount");
      searchUrl.searchParams.set("maxResults", "10");
      searchUrl.searchParams.set("publishedAfter", publishedAfter);
      searchUrl.searchParams.set("q", keyword);

      const res = await fetch(searchUrl.toString());
      if (!res.ok) return [];
      const data = await res.json();
      return data.items ?? [];
    }),
  );

  for (const items of searches) {
    for (const item of items) {
      if (item.id?.videoId) idSet.add(item.id.videoId);
    }
  }

  const ids = Array.from(idSet);
  if (ids.length === 0) return [];

  const candidates: YoutubeCandidate[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    videosUrl.searchParams.set("key", apiKey);
    videosUrl.searchParams.set("part", "snippet,statistics");
    videosUrl.searchParams.set("id", batch.join(","));

    const res = await fetch(videosUrl.toString());
    if (!res.ok) continue;
    const data = await res.json();
    for (const item of data.items ?? []) {
      candidates.push({
        videoId: item.id,
        url: `https://www.youtube.com/watch?v=${item.id}`,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails?.high?.url ?? item.snippet.thumbnails?.default?.url ?? "",
        publishedAt: item.snippet.publishedAt,
        viewCount: Number(item.statistics?.viewCount ?? 0),
        likeCount: Number(item.statistics?.likeCount ?? 0),
        commentCount: Number(item.statistics?.commentCount ?? 0),
      });
    }
  }

  return candidates.sort((a, b) => b.viewCount - a.viewCount).slice(0, limit);
}
