"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { inputClass, primaryButtonClass } from "@/lib/styles";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        },
      });

      if (error) {
        setError(
          error.message === "User already registered"
            ? "このメールアドレスはすでに登録されています"
            : "登録に失敗しました。しばらくしてから再試行してください"
        );
        return;
      }

      setIsDone(true);
    } finally {
      setIsLoading(false);
    }
  }

  if (isDone) {
    return (
      <div className="text-center space-y-3">
        <div className="text-4xl">📧</div>
        <h3 className="font-semibold text-parchment">確認メールを送信しました</h3>
        <p className="text-sm text-mist">
          {email} に確認メールを送りました。
          <br />
          メール内のリンクをクリックして登録を完了してください。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-mist mb-1">
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-mist mb-1">
          パスワード
          <span className="ml-1 text-xs text-cinder">（8文字以上）</span>
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-950/40 rounded-lg px-3 py-2 border border-red-900/50">
          {error}
        </p>
      )}

      <button type="submit" disabled={isLoading} className={primaryButtonClass}>
        {isLoading ? "登録中..." : "アカウントを作成"}
      </button>

      <p className="text-center text-sm text-cinder">
        すでにアカウントをお持ちの方は{" "}
        <Link href="/login" className="text-ember hover:text-flame font-medium">
          ログイン
        </Link>
      </p>
    </form>
  );
}
