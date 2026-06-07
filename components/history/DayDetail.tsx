"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MealLogForHistory } from "@/lib/types/home";
import { COOKED_BY_LABELS } from "@/lib/types/home";
import { inputClass } from "@/lib/styles";
import type { CookedBy, MenuCategory } from "@/lib/supabase/types";

const CATEGORY_OPTIONS: MenuCategory[] = ["和食", "洋食", "中華", "麺", "丼", "その他"];
const COOKED_BY_OPTIONS = Object.entries(COOKED_BY_LABELS) as [CookedBy, string][];

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日（${"日月火水木金土"[d.getDay()]}）`;
}

type EditState = {
  menuName: string;
  menuCategory: MenuCategory;
  cookedBy: CookedBy;
  memo: string;
  eatenAt: string;
  saving: boolean;
  error: string | null;
};

function LogItem({ log }: { log: MealLogForHistory }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditState>({
    menuName: log.menus?.name ?? "",
    menuCategory: (log.menus?.category ?? "その他") as MenuCategory,
    cookedBy: log.cooked_by,
    memo: log.memo ?? "",
    eatenAt: log.eaten_at,
    saving: false,
    error: null,
  });

  async function handleSave() {
    setForm((f) => ({ ...f, saving: true, error: null }));

    const res = await fetch("/api/record", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: log.id,
        menuName: form.menuName.trim(),
        menuCategory: form.menuCategory,
        cookedBy: form.cookedBy,
        memo: form.memo.trim() || undefined,
        eatenAt: form.eatenAt,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setForm((f) => ({ ...f, saving: false, error: json.error ?? "更新に失敗しました" }));
      return;
    }

    setForm((f) => ({ ...f, saving: false }));
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <li className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
            {log.menus?.name ?? "不明なメニュー"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {COOKED_BY_LABELS[log.cooked_by]}
            {log.memo && <span className="ml-2">— {log.memo}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {log.menus?.category && (
            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-600">
              {log.menus.category}
            </span>
          )}
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-gray-400 hover:text-orange-500 transition-colors"
          >
            編集
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="space-y-3 rounded-xl bg-orange-50 border border-orange-100 p-3">
      <div className="space-y-2">
        <input
          type="text"
          value={form.menuName}
          onChange={(e) => setForm((f) => ({ ...f, menuName: e.target.value }))}
          placeholder="メニュー名"
          className={inputClass}
        />
        <select
          value={form.menuCategory}
          onChange={(e) => setForm((f) => ({ ...f, menuCategory: e.target.value as MenuCategory }))}
          className={inputClass}
        >
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {COOKED_BY_OPTIONS.map(([value, label]) => (
          <button
            key={value}
            onClick={() => setForm((f) => ({ ...f, cookedBy: value }))}
            className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-all ${
              form.cookedBy === value
                ? "bg-orange-100 border-orange-300 text-orange-700"
                : "bg-white border-gray-200 text-gray-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <input
        type="date"
        value={form.eatenAt}
        onChange={(e) => setForm((f) => ({ ...f, eatenAt: e.target.value }))}
        className={inputClass}
      />

      <textarea
        value={form.memo}
        onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
        placeholder="メモ（任意）"
        rows={2}
        className={`${inputClass} resize-none`}
      />

      {form.error && (
        <p className="text-xs text-red-500">{form.error}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={form.saving || form.menuName.trim() === ""}
          className="flex-1 rounded-lg bg-orange-500 py-1.5 text-xs font-medium text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          {form.saving ? "保存中..." : "保存"}
        </button>
        <button
          onClick={() => setEditing(false)}
          className="flex-1 rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </li>
  );
}

type Props = {
  date: string;
  logs: MealLogForHistory[];
};

export default function DayDetail({ date, logs }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-orange-100 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">
        {formatDisplayDate(date)}
      </h3>
      <ul className="space-y-3">
        {logs.map((log) => (
          <LogItem key={log.id} log={log} />
        ))}
      </ul>
    </div>
  );
}
