import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RecordBody = {
  sessionId?: string;
  menuId?: string;
  menuName: string;
  menuCategory: string;
  cookedBy: string;
  memo?: string;
  eatenAt: string;
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "未認証です" }, { status: 401 });
  }

  const body: RecordBody = await req.json();
  const { sessionId, menuId, menuName, menuCategory, cookedBy, memo, eatenAt } = body;

  // menuId があればそのまま使用、なければ名前で SELECT → INSERT してIDを取得
  // UPDATE の RLS を避けるため upsert ではなく SELECT → INSERT の順で処理
  let resolvedMenuId = menuId && menuId !== "" ? menuId : null;

  if (!resolvedMenuId) {
    const { data: existing } = await supabase
      .from("menus")
      .select("id")
      .eq("name", menuName)
      .maybeSingle();

    if (existing) {
      resolvedMenuId = existing.id;
    } else {
      const { data: inserted } = await supabase
        .from("menus")
        .insert({ name: menuName, category: menuCategory as never, is_shared: false, created_by: user.id })
        .select("id")
        .single();

      if (!inserted) {
        return NextResponse.json(
          { error: "メニューの保存に失敗しました" },
          { status: 500 }
        );
      }
      resolvedMenuId = inserted.id;
    }
  }

  // 実食記録を保存
  const { error: insertError } = await supabase.from("meal_logs").insert({
    user_id: user.id,
    session_id: sessionId ?? null,
    menu_id: resolvedMenuId,
    cooked_by: cookedBy as never,
    memo: memo ?? null,
    eaten_at: eatenAt,
  });

  if (insertError) {
    console.error("meal_log 保存エラー:", insertError);
    return NextResponse.json(
      { error: "記録の保存に失敗しました" },
      { status: 500 }
    );
  }

  // セッションの selected_menu_id を更新
  if (sessionId) {
    await supabase
      .from("suggestion_sessions")
      .update({ selected_menu_id: resolvedMenuId })
      .eq("id", sessionId)
      .eq("user_id", user.id);
  }

  return NextResponse.json({ success: true });
}
