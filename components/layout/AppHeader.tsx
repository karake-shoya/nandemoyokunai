"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AppHeader({ displayName }: { displayName: string | null }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="bg-night border-b border-edge sticky top-0 z-10">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/home"
          className="font-mincho text-base font-bold text-parchment hover:text-ember transition-colors tracking-wide"
        >
          なんでもよくない
        </Link>
        <div className="flex items-center gap-4">
          {displayName && (
            <span className="hidden sm:block text-sm text-mist">{displayName}</span>
          )}
          <Link href="/settings" className="text-sm text-cinder hover:text-mist transition-colors">
            設定
          </Link>
          <button
            onClick={handleSignOut}
            className="text-sm text-cinder hover:text-mist transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
}
