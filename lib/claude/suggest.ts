import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { TonePreference } from "@/lib/supabase/types";

export type SuggestParams = {
  partnerName: string;
  likes: string | null;
  dislikes: string | null;
  cookingTendency: string | null;
  excludeMenuNames: string[];
  excludeDays: number;
  tonePreference: TonePreference;
};

const SuggestOutputSchema = z.object({
  menus: z
    .array(
      z.object({
        name: z.string(),
        category: z.string(),
        reason: z.string(),
      })
    )
    .min(3)
    .max(5),
  messages: z
    .array(
      z.object({
        tone: z.enum(["polite", "casual", "emoji"]),
        text: z.string(),
      })
    )
    .length(3),
});

export type SuggestOutput = z.infer<typeof SuggestOutputSchema>;

const SYSTEM_PROMPT = `あなたは晩ごはんの提案アシスタントです。
ユーザーがパートナーから「今日の晩ごはん何がいい？」と聞かれたときに、
気の利いた返答と具体的なメニュー候補を提案します。

以下のルールを守ってください：
- メニュー候補はちょうど4件、バリエーションをつけて提案する
- 除外リストのメニューは絶対に提案しない
- パートナーの好み・嫌いなものを最優先で考慮する
- 返答文章は3パターン必ず生成する（polite・casual・emoji の各1件ずつ）
- tone が "polite" は丁寧・気遣い重視、"casual" はフランクで自然、"emoji" は絵文字を2〜3個使う
- reason（提案理由）はパートナーへの気遣いや具体的な理由を1〜2文で書く
- カテゴリは「和食」「洋食」「中華」「麺」「丼」「その他」のいずれかにする`;

function buildUserMessage(params: SuggestParams): string {
  const lines: string[] = [];

  lines.push(`パートナーの名前: ${params.partnerName}`);

  if (params.likes) {
    lines.push(`好きなもの: ${params.likes}`);
  }
  if (params.dislikes) {
    lines.push(`嫌いなもの・アレルギー: ${params.dislikes}`);
  }
  if (params.cookingTendency) {
    lines.push(`料理の傾向: ${params.cookingTendency}`);
  }

  if (params.excludeMenuNames.length > 0) {
    lines.push(
      `直近${params.excludeDays}日間に食べたメニュー（除外）: ${params.excludeMenuNames.join("、")}`
    );
  } else {
    lines.push("直近に食べたメニュー: なし（何でも提案OK）");
  }

  lines.push(
    `ユーザーの返答トーン設定: ${params.tonePreference}（ただし3パターンすべて生成すること）`
  );

  return lines.join("\n");
}

export async function generateSuggestion(
  params: SuggestParams
): Promise<SuggestOutput> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.parse({
    model: "claude-haiku-4-5",
    max_tokens: 2048,
    output_config: { format: zodOutputFormat(SuggestOutputSchema) },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserMessage(params) }],
  });

  if (!response.parsed_output) {
    throw new Error("Claude からの応答のパースに失敗しました");
  }

  return response.parsed_output;
}
