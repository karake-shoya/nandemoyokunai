"use client";

import { useState } from "react";

type ToneLabel = "polite" | "casual" | "emoji";

const TONE_LABELS: Record<ToneLabel, string> = {
  polite: "丁寧",
  casual: "カジュアル",
  emoji: "絵文字入り",
};

const TONE_COLORS: Record<ToneLabel, string> = {
  polite: "text-gold bg-gold/10",
  casual: "text-flame bg-flame/10",
  emoji: "text-ember bg-ember/10",
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
    <div className="bg-surface rounded-xl border border-edge p-4">
      <div className="flex items-center justify-between mb-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${TONE_COLORS[message.tone]}`}
        >
          {TONE_LABELS[message.tone]}
        </span>
        <button
          onClick={handleCopy}
          className={`text-xs transition-colors ${
            copied ? "text-ember" : "text-cinder hover:text-mist"
          }`}
        >
          {copied ? "コピー済み ✓" : "コピー"}
        </button>
      </div>
      <p className="text-sm text-parchment leading-relaxed">{message.text}</p>
    </div>
  );
}
