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

  const [useProposed, setUseProposed] = useState(true);
  const [customMenuName, setCustomMenuName] = useState("");
  const [customMenuCategory, setCustomMenuCategory] = useState<MenuCategory>("その他");
  const [cookedBy, setCookedBy] = useState<CookedBy | null>(null);
  const [memo, setMemo] = useState("");
  const [eatenAt, setEatenAt] = useState(todayString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveMenuName = useProposed ? proposedMenuName : customMenuName;
  const effectiveMenuCategory = useProposed ? proposedMenuCategory : customMenuCategory;
  const canSubmit = effectiveMenuName.trim() !== "" && cookedBy !== null && !isSubmitting;

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
          menuId: useProposed ? menuId : undefined,
          menuName: effectiveMenuName.trim(),
          menuCategory: effectiveMenuCategory,
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
    <div className="space-y-6">
      {/* 何を食べた？ */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          何を食べた？
        </h2>

        {useProposed ? (
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-gray-800">
              {proposedMenuName}
              <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
                {proposedMenuCategory}
              </span>
            </span>
            <button
              onClick={() => setUseProposed(false)}
              className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
            >
              別のメニューにする
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="メニュー名を入力"
              value={customMenuName}
              onChange={(e) => setCustomMenuName(e.target.value)}
              className={inputClass}
            />
            <select
              value={customMenuCategory}
              onChange={(e) => setCustomMenuCategory(e.target.value as MenuCategory)}
              className={inputClass}
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {proposedMenuName && (
              <button
                onClick={() => setUseProposed(true)}
                className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
              >
                提案メニュー（{proposedMenuName}）に戻す
              </button>
            )}
          </div>
        )}
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
