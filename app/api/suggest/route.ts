import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSuggestion } from "@/lib/claude/suggest";

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "未認証です" }, { status: 401 });
  }

  // ユーザー設定とパートナー情報を並列取得
  const [{ data: userRow }, { data: partner }] = await Promise.all([
    supabase
      .from("users")
      .select("tone_preference, exclude_days")
      .eq("id", user.id)
      .single(),
    supabase
      .from("partners")
      .select("name, likes, dislikes, cooking_tendency")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!userRow || !partner) {
    return NextResponse.json(
      { error: "プロフィールが設定されていません" },
      { status: 400 }
    );
  }

  // 直近の除外メニューを取得してメニュー名に変換
  const { data: recentMenuIds } = await supabase.rpc("get_recent_menus", {
    p_user_id: user.id,
    p_days: userRow.exclude_days,
  });

  let excludeMenuNames: string[] = [];
  if (recentMenuIds && recentMenuIds.length > 0) {
    const ids = recentMenuIds.map((r) => r.menu_id);
    const { data: recentMenus } = await supabase
      .from("menus")
      .select("name")
      .in("id", ids);
    excludeMenuNames = (recentMenus ?? []).map((m) => m.name);
  }

  // Claude API で提案生成
  let suggestion;
  try {
    suggestion = await generateSuggestion({
      partnerName: partner.name,
      likes: partner.likes,
      dislikes: partner.dislikes,
      cookingTendency: partner.cooking_tendency,
      excludeMenuNames,
      excludeDays: userRow.exclude_days,
      tonePreference: userRow.tone_preference,
    });
  } catch (err) {
    console.error("提案生成エラー:", err);
    return NextResponse.json(
      { error: "AI提案の生成に失敗しました。しばらく後でお試しください。" },
      { status: 500 }
    );
  }

  // メニューを SELECT-first で取得（既存なら再利用、なければ新規作成）
  // UPDATE の RLS を避けるため upsert ではなく SELECT → INSERT の順で処理
  const upsertedMenus: { id: string; name: string; category: string }[] = [];
  for (const menu of suggestion.menus) {
    const { data: existing } = await supabase
      .from("menus")
      .select("id, name, category")
      .eq("name", menu.name)
      .maybeSingle();

    if (existing) {
      upsertedMenus.push(existing);
    } else {
      const { data: inserted } = await supabase
        .from("menus")
        .insert({ name: menu.name, category: menu.category as never, is_shared: true, created_by: null })
        .select("id, name, category")
        .single();
      if (inserted) upsertedMenus.push(inserted);
    }
  }

  // 提案セッション作成
  const today = new Date().toISOString().split("T")[0];
  const { data: session } = await supabase
    .from("suggestion_sessions")
    .insert({
      user_id: user.id,
      suggested_at: today,
      generated_message: suggestion.messages[0]?.text ?? null,
    })
    .select("id")
    .single();

  if (!session) {
    return NextResponse.json(
      { error: "セッションの保存に失敗しました" },
      { status: 500 }
    );
  }

  // 提案メニュー明細を保存
  const itemInserts = upsertedMenus.map((menu, index) => ({
    session_id: session.id,
    menu_id: menu.id,
    order_index: index,
  }));

  await supabase.from("suggestion_items").insert(itemInserts);

  return NextResponse.json({
    sessionId: session.id,
    menus: suggestion.menus.map((menu, index) => ({
      ...menu,
      id: upsertedMenus[index]?.id,
    })),
    messages: suggestion.messages,
  });
}
