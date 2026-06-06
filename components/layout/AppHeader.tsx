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
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/home" className="text-base font-bold text-orange-700 hover:text-orange-500 transition-colors">
          なんでもよくない
        </Link>
        <div className="flex items-center gap-3">
          {displayName && (
            <span className="text-sm text-gray-500">{displayName}</span>
          )}
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
}
