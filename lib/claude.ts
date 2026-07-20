import Anthropic from "@anthropic-ai/sdk";
import type { AiSummary, Platform } from "./types";

const MODEL = process.env.AI_MODEL ?? "LongCat-2.0";

const SUMMARY_TOOL = {
  name: "submit_summary",
  description: "提交对该条视频的创意拆解结果",
  input_schema: {
    type: "object" as const,
    properties: {
      hook: { type: "string", description: "视频开头3-5秒的抓人手法，具体描述用了什么钩子" },
      structure: { type: "string", description: "视频的内容结构/叙事框架，分几段、每段在做什么" },
      creative_angle: { type: "string", description: "这条视频的创意点/差异化角度是什么" },
      applicable_ideas: {
        type: "string",
        description: "结合校服行业（对标账号：青青世界校服）给出2-3条可直接借鉴到我们视频里的具体拍摄/剪辑建议",
      },
      one_line: { type: "string", description: "一句话总结这条视频为什么能火" },
    },
    required: ["hook", "structure", "creative_angle", "applicable_ideas", "one_line"],
  },
};

interface SummarizeInput {
  platform: Platform;
  title: string;
  author?: string | null;
  contentNote?: string | null;
  stats?: Record<string, unknown> | null;
}

export async function summarizeVideo(input: SummarizeInput): Promise<AiSummary> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing AI_API_KEY env var");
  }
  const client = new Anthropic({
    apiKey,
    baseURL: process.env.AI_BASE_URL,
    defaultHeaders: { Authorization: `Bearer ${apiKey}` },
  });

  const prompt = `你是一名短视频内容策划顾问，服务对象是一家校服公司的视频编辑团队，团队的对标账号是"青青世界校服"。
现在有一条同行业/相关行业的爆款视频，信息如下：
- 平台：${input.platform}
- 标题：${input.title}
- 账号：${input.author ?? "未知"}
- 数据表现：${input.stats ? JSON.stringify(input.stats) : "未知"}
- 内容描述/文案脚本：${input.contentNote ?? "无，请仅基于标题和账号信息合理推测"}

请拆解这条视频的创意框架，帮编辑团队提炼可复用的思路，调用 submit_summary 工具提交结果。`;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    tools: [SUMMARY_TOOL],
    tool_choice: { type: "tool", name: "submit_summary" },
    messages: [{ role: "user", content: prompt }],
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("模型没有返回结构化拆解结果");
  }
  return toolUse.input as AiSummary;
}
