import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { TonePreference } from "@/lib/supabase/types";

const VALID_TONES: TonePreference[] = ["polite", "casual", "emoji"];

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { partnerName, likes, dislikes, cookingTendency, displayName, tonePreference, excludeDays } =
    body;

  if (!partnerName?.trim()) {
    return NextResponse.json({ error: "パートナーの名前は必須です" }, { status: 400 });
  }
  if (!VALID_TONES.includes(tonePreference)) {
    return NextResponse.json({ error: "無効なトーンです" }, { status: 400 });
  }
  const days = Number(excludeDays);
  if (!Number.isInteger(days) || days < 1 || days > 30) {
    return NextResponse.json({ error: "除外日数は1〜30の整数で指定してください" }, { status: 400 });
  }

  const [{ error: partnerError }, { error: userError }] = await Promise.all([
    supabase
      .from("partners")
      .update({
        name: partnerName.trim(),
        likes: likes?.trim() || null,
        dislikes: dislikes?.trim() || null,
        cooking_tendency: cookingTendency?.trim() || null,
      })
      .eq("user_id", user.id),
    supabase
      .from("users")
      .update({
        display_name: displayName?.trim() || null,
        tone_preference: tonePreference as TonePreference,
        exclude_days: days,
      })
      .eq("id", user.id),
  ]);

  if (partnerError || userError) {
    return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
