import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CalendarView from "@/components/history/CalendarView";
import type { MealLogForHistory } from "@/lib/types/home";

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: logs } = await supabase
    .from("meal_logs")
    .select("id, eaten_at, cooked_by, memo, menus!meal_logs_menu_id_fkey(name, category)")
    .eq("user_id", user.id)
    .order("eaten_at", { ascending: false });

  return (
    <div className="space-y-4">
      <Link
        href="/home"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        ← ホームに戻る
      </Link>

      <CalendarView logs={(logs ?? []) as MealLogForHistory[]} />
    </div>
  );
}
