import { runYoutubeCron } from "../../lib/cron-youtube";

// 后台函数（文件名以 -background 结尾），执行上限 15 分钟，
// 足够跑完当天 10 条的 AI 拆解（单条约 15-30 秒）。
export default async (req: Request) => {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("unauthorized", { status: 401 });
  }

  const result = await runYoutubeCron();
  console.log("[daily-youtube-background]", JSON.stringify(result));
  return new Response(JSON.stringify(result), {
    headers: { "content-type": "application/json" },
  });
};
