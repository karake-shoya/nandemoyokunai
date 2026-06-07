"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { inputClass, primaryButtonClass } from "@/lib/styles";
import type { CookedBy, MenuCategory } from "@/lib/supabase/types";
import MessageCard from "@/components/proposal/MessageCard";
import { CATEGORY_OPTIONS, COOKED_BY_OPTIONS } from "@/lib/constants";
import { localDateString } from "@/lib/date";

type Message = {
  tone: "polite" | "casual" | "emoji";
  text: string;
};

export default function RecordPage() {
  const router = useRouter();
  const params = useSearchParams();

  const sessionId = params.get("sessionId") ?? undefined;
  const proposedMenuId = params.get("menuId") ?? undefined;
  const proposedMenuName = params.get("menuName") ?? "";
  const proposedMenuCategory = (params.get("menuCategory") ?? "その他") as MenuCategory;

  const messages = useMemo<Message[]>(() => {
    if (!sessionId) return [];
    try {
      const stored = sessionStorage.getItem(`messages-${sessionId}`);
      return stored ? (JSON.parse(stored) as Message[]) : [];
    } catch {
      return [];
    }
  }, [sessionId]);

  const [actualMenuName, setActualMenuName] = useState("");
  const [actualMenuCategory, setActualMenuCategory] = useState<MenuCategory>("その他");
  const [isUsingProposed, setIsUsingProposed] = useState(false);
  const [cookedBy, setCookedBy] = useState<CookedBy | null>(null);
  const [memo, setMemo] = useState("");
  const [eatenAt, setEatenAt] = useState(localDateString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleUseProposed() {
    setActualMenuName(proposedMenuName);
    setActualMenuCategory(proposedMenuCategory);
    setIsUsingProposed(true);
  }

  function handleMenuNameChange(value: string) {
    setActualMenuName(value);
    setIsUsingProposed(false);
  }

  const canSubmit = actualMenuName.trim() !== "" && cookedBy !== null && !isSubmitting;

  async function handleSubmit() {
    if (!canSubmit || cookedBy === null) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          proposedMenuId,
          actualMenuId: isUsingProposed ? proposedMenuId : undefined,
          menuName: actualMenuName.trim(),
          menuCategory: actualMenuCategory,
          cookedBy,
          memo: memo.trim() || undefined,
          eatenAt,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "保存に失敗しました");
        return;
      }

      router.push("/home");
    } catch {
      setError("通信エラーが発生しました。接続を確認してください。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Link
        href="/proposal"
        className="inline-flex items-center gap-1 text-sm text-cinder hover:text-mist transition-colors"
      >
        ← 提案に戻る
      </Link>

      {proposedMenuName && (
        <div className="bg-surface rounded-2xl border border-edge p-5 space-y-2">
          <h2 className="text-xs font-medium text-mist uppercase tracking-widest">
            提案したメニュー
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-parchment">{proposedMenuName}</span>
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">
              {proposedMenuCategory}
            </span>
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-medium text-mist uppercase tracking-widest">
            返答文章
          </h2>
          {messages.map((msg, i) => (
            <MessageCard key={i} message={msg} />
          ))}
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-edge p-5 space-y-3">
        <h2 className="text-xs font-medium text-mist uppercase tracking-widest">
          実際に食べたメニュー
        </h2>

        {proposedMenuName && (
          <button
            onClick={handleUseProposed}
            className={`w-full rounded-xl border px-3 py-2.5 text-sm font-medium text-left transition-all ${
              isUsingProposed
                ? "bg-coal border-ember text-ember ring-1 ring-ember/40"
                : "bg-raised border-edge text-mist hover:border-rim"
            }`}
          >
            {isUsingProposed ? "✓ " : ""}提案と同じ（{proposedMenuName}）
          </button>
        )}

        <input
          type="text"
          placeholder="メニュー名を入力"
          value={actualMenuName}
          onChange={(e) => handleMenuNameChange(e.target.value)}
          className={inputClass}
        />
        <select
          value={actualMenuCategory}
          onChange={(e) => {
            setActualMenuCategory(e.target.value as MenuCategory);
            setIsUsingProposed(false);
          }}
          className={inputClass}
        >
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-surface rounded-2xl border border-edge p-5 space-y-3">
        <h2 className="text-xs font-medium text-mist uppercase tracking-widest">
          誰が作った？
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {COOKED_BY_OPTIONS.map(([value, label]) => (
            <button
              key={value}
              onClick={() => setCookedBy(value)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                cookedBy === value
                  ? "bg-coal border-ember text-ember ring-1 ring-ember/40"
                  : "bg-raised border-edge text-mist hover:border-rim"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-edge p-5 space-y-3">
        <h2 className="text-xs font-medium text-mist uppercase tracking-widest">
          いつ食べた？
        </h2>
        <input
          type="date"
          value={eatenAt}
          onChange={(e) => setEatenAt(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="bg-surface rounded-2xl border border-edge p-5 space-y-3">
        <h2 className="text-xs font-medium text-mist uppercase tracking-widest">
          メモ（任意）
        </h2>
        <textarea
          placeholder="感想・アレンジなど"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`${primaryButtonClass} mt-2`}
      >
        {isSubmitting ? "保存中..." : "記録する"}
      </button>
    </div>
  );
}
