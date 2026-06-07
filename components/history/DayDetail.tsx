"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MealLogForHistory } from "@/lib/types/home";
import { COOKED_BY_LABELS } from "@/lib/types/home";
import { inputClass } from "@/lib/styles";
import type { CookedBy, MenuCategory } from "@/lib/supabase/types";
import { CATEGORY_OPTIONS, COOKED_BY_OPTIONS } from "@/lib/constants";

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

function logToForm(log: MealLogForHistory): EditState {
  return {
    menuName: log.menus?.name ?? "",
    menuCategory: (log.menus?.category ?? "その他") as MenuCategory,
    cookedBy: log.cooked_by,
    memo: log.memo ?? "",
    eatenAt: log.eaten_at,
    saving: false,
    error: null,
  };
}

function LogItem({
  log,
  onDateChange,
}: {
  log: MealLogForHistory;
  onDateChange: (date: string) => void;
}) {
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
    if (form.eatenAt !== log.eaten_at) {
      onDateChange(form.eatenAt);
    }
    router.refresh();
  }

  if (!editing) {
    return (
      <li className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-parchment truncate">
            {log.menus?.name ?? "不明なメニュー"}
          </p>
          <p className="text-xs text-cinder mt-0.5">
            {COOKED_BY_LABELS[log.cooked_by]}
            {log.memo && <span className="ml-2">— {log.memo}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {log.menus?.category && (
            <span className="rounded-full bg-gold/10 px-2 py-0.5 text-xs text-gold">
              {log.menus.category}
            </span>
          )}
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-cinder hover:text-ember transition-colors"
          >
            編集
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="space-y-3 rounded-xl bg-coal border border-edge/50 p-3">
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
          onChange={(e) =>
            setForm((f) => ({ ...f, menuCategory: e.target.value as MenuCategory }))
          }
          className={inputClass}
        >
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
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
                ? "bg-coal border-ember text-ember"
                : "bg-raised border-edge text-mist"
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

      {form.error && <p className="text-xs text-red-400">{form.error}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={form.saving || form.menuName.trim() === ""}
          className="flex-1 rounded-lg bg-ember py-1.5 text-xs font-semibold text-white hover:bg-flame disabled:opacity-40 transition-colors"
        >
          {form.saving ? "保存中..." : "保存"}
        </button>
        <button
          onClick={() => {
            setEditing(false);
            setForm(logToForm(log));
          }}
          className="flex-1 rounded-lg border border-edge py-1.5 text-xs font-medium text-mist hover:bg-haze transition-colors"
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
  onDateChange: (date: string) => void;
};

export default function DayDetail({ date, logs, onDateChange }: Props) {
  return (
    <div className="bg-surface rounded-2xl border border-edge p-4 space-y-3">
      <h3 className="text-sm font-semibold text-parchment">{formatDisplayDate(date)}</h3>
      <ul className="space-y-3">
        {logs.map((log) => (
          <LogItem key={log.id} log={log} onDateChange={onDateChange} />
        ))}
      </ul>
    </div>
  );
}
