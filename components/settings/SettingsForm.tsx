"use client";

import { useState } from "react";
import { inputClass, primaryButtonClass } from "@/lib/styles";
import type { TonePreference } from "@/lib/supabase/types";

const TONE_OPTIONS: { value: TonePreference; label: string; description: string }[] = [
  { value: "polite", label: "丁寧", description: "「〜してもらえると嬉しいな」" },
  { value: "casual", label: "カジュアル", description: "「〜でよくない？」" },
  { value: "emoji", label: "絵文字多め", description: "「〜はどう？😊✨」" },
];

type Props = {
  initialPartner: {
    name: string;
    likes: string | null;
    dislikes: string | null;
    cooking_tendency: string | null;
  };
  initialUser: {
    display_name: string | null;
    tone_preference: TonePreference;
    exclude_days: number;
  };
};

export default function SettingsForm({ initialPartner, initialUser }: Props) {
  const [partnerName, setPartnerName] = useState(initialPartner.name);
  const [likes, setLikes] = useState(initialPartner.likes ?? "");
  const [dislikes, setDislikes] = useState(initialPartner.dislikes ?? "");
  const [cookingTendency, setCookingTendency] = useState(initialPartner.cooking_tendency ?? "");

  const [displayName, setDisplayName] = useState(initialUser.display_name ?? "");
  const [tonePreference, setTonePreference] = useState<TonePreference>(
    initialUser.tone_preference
  );
  const [excludeDays, setExcludeDays] = useState(initialUser.exclude_days);

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!partnerName.trim()) return;
    setIsSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerName,
          likes,
          dislikes,
          cookingTendency,
          displayName,
          tonePreference,
          excludeDays,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "保存に失敗しました");
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("通信エラーが発生しました。接続を確認してください。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-surface rounded-2xl border border-edge p-5 space-y-4">
        <h2 className="text-xs font-medium text-mist uppercase tracking-widest">
          パートナー情報
        </h2>

        <div>
          <label className="block text-sm font-medium text-mist mb-1">
            名前 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            placeholder="例：たろう"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-mist mb-1">
            好きな食べ物・料理
          </label>
          <input
            type="text"
            value={likes}
            onChange={(e) => setLikes(e.target.value)}
            placeholder="例：ラーメン、唐揚げ、カレー"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-mist mb-1">
            苦手な食べ物・料理
          </label>
          <input
            type="text"
            value={dislikes}
            onChange={(e) => setDislikes(e.target.value)}
            placeholder="例：辛いもの、生魚"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-mist mb-1">
            料理の傾向
          </label>
          <input
            type="text"
            value={cookingTendency}
            onChange={(e) => setCookingTendency(e.target.value)}
            placeholder="例：よく作ってくれる、外食派"
            className={inputClass}
          />
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-edge p-5 space-y-4">
        <h2 className="text-xs font-medium text-mist uppercase tracking-widest">
          自分の設定
        </h2>

        <div>
          <label className="block text-sm font-medium text-mist mb-1">
            表示名（任意）
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="例：はなこ"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-mist mb-2">
            返答のトーン
          </label>
          <div className="space-y-2">
            {TONE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-colors ${
                  tonePreference === opt.value
                    ? "border-ember bg-coal"
                    : "border-edge hover:border-rim"
                }`}
              >
                <input
                  type="radio"
                  name="tone"
                  value={opt.value}
                  checked={tonePreference === opt.value}
                  onChange={() => setTonePreference(opt.value)}
                  className="accent-[#e07228]"
                />
                <div>
                  <div className="text-sm font-medium text-parchment">{opt.label}</div>
                  <div className="text-xs text-mist">{opt.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-mist mb-1">
            重複除外日数
            <span className="ml-1 text-xs text-cinder">（直近何日間のメニューを除外するか）</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={30}
              value={excludeDays}
              onChange={(e) => setExcludeDays(Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-12 text-center text-sm font-medium text-parchment">
              {excludeDays}日
            </span>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-950/40 rounded-lg px-3 py-2 border border-red-900/50">
          {error}
        </p>
      )}

      {saved && (
        <p className="text-sm text-emerald-400 text-center animate-fade-up">
          保存しました ✓
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={isSaving || !partnerName.trim()}
        className={primaryButtonClass}
      >
        {isSaving ? "保存中..." : "保存する"}
      </button>
    </div>
  );
}
