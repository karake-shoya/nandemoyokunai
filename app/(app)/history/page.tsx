import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CalendarView from "@/components/history/CalendarView";
import type { MealLogForHistory } from "@/lib/types/home";
import { localDateString } from "@/lib/date";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { month: monthParam } = await searchParams;

  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const monthStr = /^\d{4}-\d{2}$/.test(monthParam ?? "") ? monthParam! : defaultMonth;

  const [yearStr, monthNumStr] = monthStr.split("-");
  const year = parseInt(yearStr);
  const month = parseInt(monthNumStr);

  const startDate = `${yearStr}-${monthNumStr}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${yearStr}-${monthNumStr}-${String(lastDay).padStart(2, "0")}`;

  const { data: logs } = await supabase
    .from("meal_logs")
    .select("id, eaten_at, cooked_by, memo, menus!meal_logs_menu_id_fkey(name, category)")
    .eq("user_id", user.id)
    .gte("eaten_at", startDate)
    .lte("eaten_at", endDate)
    .order("eaten_at", { ascending: false });

  return (
    <div className="space-y-4">
      <Link
        href="/home"
        className="inline-flex items-center gap-1 text-sm text-cinder hover:text-mist transition-colors"
      >
        ← ホームに戻る
      </Link>

      <CalendarView
        logs={(logs ?? []) as MealLogForHistory[]}
        initialYear={year}
        initialMonth={month - 1}
      />
    </div>
  );
}
