"use client";

import { useState } from "react";

type ToneLabel = "polite" | "casual" | "emoji";

const TONE_LABELS: Record<ToneLabel, string> = {
  polite: "丁寧",
  casual: "カジュアル",
  emoji: "絵文字入り",
};

type Props = {
  message: { tone: ToneLabel; text: string };
};

export default function MessageCard({ message }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          {TONE_LABELS[message.tone]}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs text-orange-500 hover:text-orange-700 transition-colors"
        >
          {copied ? "コピー済み ✓" : "コピー"}
        </button>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{message.text}</p>
    </div>
  );
}
