"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { inputClass } from "@/lib/styles";
import type { TonePreference } from "@/lib/supabase/types";

interface Step1Data {
  partnerName: string;
  likes: string;
  dislikes: string;
  cookingTendency: string;
}

interface Step2Data {
  displayName: string;
  tonePreference: TonePreference;
  excludeDays: number;
}

const TONE_OPTIONS: { value: TonePreference; label: string; description: string }[] = [
  { value: "polite", label: "丁寧", description: "「〜してもらえると嬉しいな」" },
  { value: "casual", label: "カジュアル", description: "「〜でよくない？」" },
  { value: "emoji", label: "絵文字多め", description: "「〜はどう？😊✨」" },
];

export default function OnboardingForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [step1, setStep1] = useState<Step1Data>({
    partnerName: "",
    likes: "",
    dislikes: "",
    cookingTendency: "",
  });
  const [step2, setStep2] = useState<Step2Data>({
    displayName: "",
    tonePreference: "polite",
    excludeDays: 7,
  });

  function updateStep1<K extends keyof Step1Data>(field: K, value: Step1Data[K]) {
    setStep1((prev) => ({ ...prev, [field]: value }));
  }

  function updateStep2<K extends keyof Step2Data>(field: K, value: Step2Data[K]) {
    setStep2((prev) => ({ ...prev, [field]: value }));
  }

  async function handleComplete() {
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();

      const [{ error: partnerError }, { error: userError }] = await Promise.all([
        supabase.from("partners").insert({
          user_id: userId,
          name: step1.partnerName,
          likes: step1.likes || null,
          dislikes: step1.dislikes || null,
          cooking_tendency: step1.cookingTendency || null,
        }),
        supabase
          .from("users")
          .update({
            display_name: step2.displayName || null,
            tone_preference: step2.tonePreference,
            exclude_days: step2.excludeDays,
          })
          .eq("id", userId),
      ]);

      if (partnerError || userError) {
        setError("保存に失敗しました。もう一度お試しください。");
        return;
      }

      router.push("/home");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* ステップインジケーター */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                ${step >= s ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-400"}`}
            >
              {s}
            </div>
            {s < 2 && (
              <div className={`w-16 h-0.5 ${step > s ? "bg-orange-400" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              パートナーについて教えてください
            </h2>
            <p className="text-sm text-gray-500">より良いメニュー提案のために使います</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パートナーの名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="例：たろう"
              value={step1.partnerName}
              onChange={(e) => updateStep1("partnerName", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              好きな食べ物・料理
            </label>
            <input
              type="text"
              placeholder="例：ラーメン、唐揚げ、カレー"
              value={step1.likes}
              onChange={(e) => updateStep1("likes", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              苦手な食べ物・料理
            </label>
            <input
              type="text"
              placeholder="例：辛いもの、生魚"
              value={step1.dislikes}
              onChange={(e) => updateStep1("dislikes", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              料理の傾向
            </label>
            <input
              type="text"
              placeholder="例：よく作ってくれる、外食派、簡単なものが多い"
              value={step1.cookingTendency}
              onChange={(e) => updateStep1("cookingTendency", e.target.value)}
              className={inputClass}
            />
          </div>

          <button
            type="button"
            disabled={!step1.partnerName.trim()}
            onClick={() => setStep(2)}
            className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white
                       hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            次へ
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">あなたの設定</h2>
            <p className="text-sm text-gray-500">後から設定で変更できます</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              あなたの名前（任意）
            </label>
            <input
              type="text"
              placeholder="例：はなこ"
              value={step2.displayName}
              onChange={(e) => updateStep2("displayName", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              返答のトーン
            </label>
            <div className="space-y-2">
              {TONE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 cursor-pointer transition-colors
                    ${step2.tonePreference === opt.value
                      ? "border-orange-400 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"}`}
                >
                  <input
                    type="radio"
                    name="tone"
                    value={opt.value}
                    checked={step2.tonePreference === opt.value}
                    onChange={() => updateStep2("tonePreference", opt.value)}
                    className="text-orange-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-800">{opt.label}</div>
                    <div className="text-xs text-gray-500">{opt.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              重複除外日数
              <span className="ml-1 text-xs text-gray-400">（直近何日間のメニューを除外するか）</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={30}
                value={step2.excludeDays}
                onChange={(e) => updateStep2("excludeDays", Number(e.target.value))}
                className="flex-1 accent-orange-500"
              />
              <span className="w-12 text-center text-sm font-medium text-gray-700">
                {step2.excludeDays}日
              </span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700
                         hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            >
              戻る
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleComplete}
              className="flex-1 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white
                         hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "保存中..." : "はじめる"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
