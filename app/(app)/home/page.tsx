import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CtaCard from "@/components/home/CtaCard";
import MealLogList from "@/components/home/MealLogList";
import type { MealLogWithMenu } from "@/lib/types/home";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: partner } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!partner) redirect("/onboarding");

  const { data: mealLogs } = await supabase
    .from("meal_logs")
    .select("id, eaten_at, cooked_by, memo, menus(name, category)")
    .eq("user_id", user.id)
    .order("eaten_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <CtaCard />
      <MealLogList logs={(mealLogs ?? []) as MealLogWithMenu[]} />
    </div>
  );
}
