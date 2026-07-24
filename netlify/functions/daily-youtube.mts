// 定时函数执行上限 30 秒，装不下 AI 拆解（跨境调用 LongCat 单条就要 15-30 秒，
// 冷启动时必超）。所以这里只负责「按点扣扳机」：把活丢给上限 15 分钟的后台函数，
// 自己立刻返回。后台函数收到请求后返回 202，然后继续在后台跑完。
export default async () => {
  const target = `${process.env.URL}/.netlify/functions/daily-youtube-background`;
  const secret = process.env.CRON_SECRET;

  const res = await fetch(target, {
    method: "POST",
    headers: secret ? { authorization: `Bearer ${secret}` } : undefined,
  });

  console.log("[daily-youtube] triggered background:", res.status);
  return new Response(JSON.stringify({ triggered: true, status: res.status }), {
    headers: { "content-type": "application/json" },
  });
};

// 每天 UTC 1:00 触发一次（北京时间 9:00）。
// 后台函数内部有当天名额上限，重复触发不会超量。
export const config = {
  schedule: "0 1 * * *",
};
