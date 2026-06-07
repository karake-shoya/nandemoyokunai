import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RecordBody = {
  sessionId?: string;
  proposedMenuId?: string;
  actualMenuId?: string;
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
  const { sessionId, proposedMenuId, actualMenuId, menuName, menuCategory, cookedBy, memo, eatenAt } = body;

  // 実際に食べたメニューの ID を解決（actualMenuId があればそのまま使用）
  let resolvedMenuId = actualMenuId && actualMenuId !== "" ? actualMenuId : null;

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

  // selected_menu_id = 提案画面で選んだメニュー（実際に食べたものではない）
  if (sessionId && proposedMenuId && proposedMenuId !== "") {
    const { error: sessionUpdateError } = await supabase
      .from("suggestion_sessions")
      .update({ selected_menu_id: proposedMenuId })
      .eq("id", sessionId)
      .eq("user_id", user.id);
    if (sessionUpdateError) {
      // 食事記録は保存済みのため致命的ではないがログに残す
      console.error("selected_menu_id 更新エラー:", sessionUpdateError);
    }
  }

  return NextResponse.json({ success: true });
}

type PatchBody = {
  id: string;
  menuName: string;
  menuCategory: string;
  cookedBy: string;
  memo?: string;
  eatenAt: string;
};

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "未認証です" }, { status: 401 });
  }

  const body: PatchBody = await req.json();
  const { id, menuName, menuCategory, cookedBy, memo, eatenAt } = body;

  // メニューIDを解決（SELECT-first）
  const { data: existing } = await supabase
    .from("menus")
    .select("id")
    .eq("name", menuName)
    .maybeSingle();

  let resolvedMenuId: string;
  if (existing) {
    resolvedMenuId = existing.id;
  } else {
    const { data: inserted } = await supabase
      .from("menus")
      .insert({ name: menuName, category: menuCategory as never, is_shared: false, created_by: user.id })
      .select("id")
      .single();

    if (!inserted) {
      return NextResponse.json({ error: "メニューの保存に失敗しました" }, { status: 500 });
    }
    resolvedMenuId = inserted.id;
  }

  const { data: updated, error } = await supabase
    .from("meal_logs")
    .update({
      menu_id: resolvedMenuId,
      cooked_by: cookedBy as never,
      memo: memo ?? null,
      eaten_at: eatenAt,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    console.error("meal_log 更新エラー:", error);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }

  if (!updated || updated.length === 0) {
    return NextResponse.json({ error: "記録が見つかりませんでした" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
