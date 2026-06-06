import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingForm from "@/components/onboarding/OnboardingForm";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // オンボーディング完了済みなら /home へ
  const { data: partner } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (partner) {
    redirect("/home");
  }

  return <OnboardingForm userId={user.id} />;
}
