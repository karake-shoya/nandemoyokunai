import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// TODO: Phase 1 でホーム画面を実装する
export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // オンボーディング未完了なら /onboarding へ
  const { data: partner } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!partner) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-orange-700">なんでもよくない</h1>
        <p className="mt-2 text-gray-500">ホーム画面は実装中です</p>
      </div>
    </div>
  );
}
