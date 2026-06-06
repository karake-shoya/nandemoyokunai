"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { inputClass, primaryButtonClass } from "@/lib/styles";
import { COOKED_BY_LABELS } from "@/lib/types/home";
import type { CookedBy, MenuCategory } from "@/lib/supabase/types";

const CATEGORY_OPTIONS: MenuCategory[] = ["和食", "洋食", "中華", "麺", "丼", "その他"];
const COOKED_BY_OPTIONS = Object.entries(COOKED_BY_LABELS) as [CookedBy, string][];

function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

export default function RecordPage() {
  const router = useRouter();
  const params = useSearchParams();

  const sessionId = params.get("sessionId") ?? undefined;
  const menuId = params.get("menuId") ?? undefined;
  const proposedMenuName = params.get("menuName") ?? "";
  const proposedMenuCategory = (params.get("menuCategory") ?? "その他") as MenuCategory;

  const [actualMenuName, setActualMenuName] = useState("");
  const [actualMenuCategory, setActualMenuCategory] = useState<MenuCategory>("その他");
  const [isUsingProposed, setIsUsingProposed] = useState(false);
  const [cookedBy, setCookedBy] = useState<CookedBy | null>(null);
  const [memo, setMemo] = useState("");
  const [eatenAt, setEatenAt] = useState(todayString());
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
          menuId: isUsingProposed ? menuId : undefined,
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
      {/* 提案したメニュー（表示のみ） */}
      {proposedMenuName && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            提案したメニュー
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-gray-800">{proposedMenuName}</span>
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
              {proposedMenuCategory}
            </span>
          </div>
        </div>
      )}

      {/* 実際に食べたメニュー */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          実際に食べたメニュー
        </h2>

        {/* 提案と同じ クイック選択 */}
        {proposedMenuName && (
          <button
            onClick={handleUseProposed}
            className={`w-full rounded-xl border px-3 py-2.5 text-sm font-medium text-left transition-all ${
              isUsingProposed
                ? "bg-orange-50 border-orange-300 text-orange-700 ring-2 ring-orange-300"
                : "bg-white border-gray-200 text-gray-600 hover:border-orange-200"
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
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* 誰が作った？ */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          誰が作った？
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {COOKED_BY_OPTIONS.map(([value, label]) => (
            <button
              key={value}
              onClick={() => setCookedBy(value)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                cookedBy === value
                  ? "bg-orange-50 border-orange-300 text-orange-700 ring-2 ring-orange-300"
                  : "bg-white border-gray-200 text-gray-700 hover:border-orange-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* いつ食べた？ */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          いつ食べた？
        </h2>
        <input
          type="date"
          value={eatenAt}
          onChange={(e) => setEatenAt(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* メモ */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
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

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

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
