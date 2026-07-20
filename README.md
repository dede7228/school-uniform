# 校服行业创意库

面向校服行业视频编辑团队的"每日爆款创意库"看板。对标账号：青青世界校服。

- **YouTube**：每天自动按关键词（school uniform 相关）搜索近30天播放量高的视频，调用 Claude 生成创意拆解，自动入库。
- **抖音 / 视频号**：暂无可靠的公开数据接口，采用半自动流程——编辑在"手动录入"页面粘贴链接+简要描述内容，系统调用 Claude 自动生成创意拆解并入库。
- 每天创意库目标合计 10 条（YouTube 自动 + 人工录入 共同凑够）。
- 看板按天/平台筛选，支持收藏标记。

## 需要准备的账号与密钥

| 用途 | 去哪申请 | 对应的环境变量 |
| --- | --- | --- |
| 数据库 | [supabase.com](https://supabase.com) 免费建一个项目，在 SQL Editor 里执行 `supabase/schema.sql` | `SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`（Project Settings → API） |
| AI 创意总结 | [longcat.chat/platform](https://longcat.chat/platform) 创建 API Key | `AI_API_KEY`、`AI_BASE_URL`、`AI_MODEL` |
| YouTube 自动抓取 | [Google Cloud Console](https://console.cloud.google.com) 新建项目 → 启用 "YouTube Data API v3" → 创建 API Key | `YOUTUBE_API_KEY` |
| 看板访问口令 | 自己随便定义两个字符串即可 | `TEAM_ACCESS_CODE`（团队共用密码）、`AUTH_SECRET`（任意随机字符串，用于加密 cookie） |
| 定时任务鉴权 | 自己随便定义一个随机字符串 | `CRON_SECRET` |

把这些值填进 `.env.local`（复制 `.env.local.example` 改名），本地开发用。

## 本地开发

```bash
npm install
npm run dev
```

访问 http://localhost:3000，会先要求输入 `TEAM_ACCESS_CODE`。

## 部署到 Vercel

1. 把这个项目推到一个 GitHub 仓库。
2. 在 [vercel.com](https://vercel.com) 用 GitHub 账号登录 → Import Project → 选这个仓库。
3. 在 Vercel 项目的 Settings → Environment Variables 里，把上面表格中的所有环境变量都加进去。
4. 部署。`vercel.json` 里已经配置了每天定时调用一次 `/api/cron/youtube`（UTC 1:00，即北京时间早上9点）拉取 YouTube 数据。
5. 部署成功后把域名分享给团队，每人访问时输入口令即可，登录状态会保存30天。

## 使用方式

- **编辑日常**：打开看板首页，看当天创意库卡片（钩子/结构/创意点/可借鉴建议）。
- **录入抖音/视频号视频**：点"+ 手动录入"，粘贴链接，标题、账号，重点是"内容简述/文案脚本"要写清楚视频的画面节奏和文案，AI 拆解质量取决于这段描述的详细程度。
- **YouTube**：系统每天自动跑，不需要人工干预。

## 已知限制

- 抖音、视频号没有公开的"按账号/关键词搜索爆款"API，所以这两个平台目前是半自动（人工找视频+粘贴描述，AI 负责拆解），不是全自动抓取。后续如果团队订阅了蝉妈妈/飞瓜/新抖等第三方数据平台，可以在此基础上接入自动拉取。
- YouTube 自动抓取基于标题+简介做拆解，没有解析视频画面/字幕，拆解会比人工描述的抖音条目粗一些。
