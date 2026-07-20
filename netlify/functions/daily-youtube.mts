import { runYoutubeCron } from "../../lib/cron-youtube";

// Netlify 定时函数单次执行有时限，这里每次只抓少量，
// 在早晨时间窗内多次触发凑够当天名额；名额满后各次会快速空跑。
export default async () => {
  const result = await runYoutubeCron({ maxPerRun: 2 });
  console.log("[daily-youtube]", JSON.stringify(result));
  return new Response(JSON.stringify(result), {
    headers: { "content-type": "application/json" },
  });
};

// 每 10 分钟触发一次，UTC 1:00–3:59（北京时间 9:00–11:59）
export const config = {
  schedule: "*/10 1-3 * * *",
};
