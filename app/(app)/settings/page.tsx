import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SettingsForm from "@/components/settings/SettingsForm";
import type { TonePreference } from "@/lib/supabase/types";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: partner }, { data: userRow }] = await Promise.all([
    supabase
      .from("partners")
      .select("name, likes, dislikes, cooking_tendency")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("users")
      .select("display_name, tone_preference, exclude_days")
      .eq("id", user.id)
      .single(),
  ]);

  if (!partner) redirect("/onboarding");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/home"
          className="text-sm text-cinder hover:text-mist transition-colors"
        >
          ← ホームに戻る
        </Link>
      </div>

      <div>
        <h1 className="font-mincho text-xl font-bold text-parchment">設定</h1>
        <p className="text-sm text-mist mt-0.5">パートナー情報や好みを変更できます</p>
      </div>

      <SettingsForm
        initialPartner={partner}
        initialUser={
          userRow ?? {
            display_name: null,
            tone_preference: "polite" as TonePreference,
            exclude_days: 7,
          }
        }
      />
    </div>
  );
}
