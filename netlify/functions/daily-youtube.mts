import { runYoutubeCron } from "../../lib/cron-youtube";

// Netlify 定时函数单次执行有时限，这里每次只抓少量，
// 在早晨时间窗内多次触发凑够当天名额；名额满后各次会快速空跑。
export default async () => {
  // 一条视频的 AI 拆解约 15 秒，定时函数上限 30 秒，
  // 所以单次只处理 1 条，靠高频触发凑满当天名额。
  const result = await runYoutubeCron({ maxPerRun: 1 });
  console.log("[daily-youtube]", JSON.stringify(result));
  return new Response(JSON.stringify(result), {
    headers: { "content-type": "application/json" },
  });
};

// 每 5 分钟触发一次，UTC 1:00–4:59（北京时间 9:00–12:59）＝ 48 次机会凑 10 条。
// 名额满后各次会在调用 YouTube 前直接返回，不消耗接口配额。
export const config = {
  schedule: "*/5 1-4 * * *",
};
