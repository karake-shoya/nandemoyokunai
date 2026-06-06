import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// メール確認後のコールバック処理
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/home";
  // オープンリダイレクト防止: 自サイトの相対パスのみ許可
  const next = nextParam.startsWith("/") ? nextParam : "/home";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=callback_error`);
}
