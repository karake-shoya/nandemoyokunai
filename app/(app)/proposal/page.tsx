"use client";

import { useEffect, useState } from "react";
import MenuCard from "@/components/proposal/MenuCard";
import MessageCard from "@/components/proposal/MessageCard";
import { primaryButtonClass } from "@/lib/styles";

type Menu = {
  id?: string;
  name: string;
  category: string;
  reason: string;
};

type Message = {
  tone: "polite" | "casual" | "emoji";
  text: string;
};

type SuggestResult = {
  sessionId: string;
  menus: Menu[];
  messages: Message[];
};

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; data: SuggestResult };

export default function ProposalPage() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);

  async function fetchSuggestion() {
    setState({ status: "loading" });
    setSelectedMenuId(null);

    try {
      const res = await fetch("/api/suggest", { method: "POST" });
      const json = await res.json();

      if (!res.ok) {
        setState({
          status: "error",
          message: json.error ?? "予期しないエラーが発生しました",
        });
        return;
      }

      setState({ status: "done", data: json as SuggestResult });
    } catch {
      setState({
        status: "error",
        message: "通信エラーが発生しました。接続を確認してください。",
      });
    }
  }

  useEffect(() => {
    fetchSuggestion();
  }, []);

  if (state.status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="h-10 w-10 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
        <p className="text-sm text-gray-500">AIが考えています...</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-3xl">😢</p>
        <p className="text-sm text-gray-600 text-center">{state.message}</p>
        <button
          onClick={fetchSuggestion}
          className="mt-2 rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
        >
          もう一度試す
        </button>
      </div>
    );
  }

  const { menus, messages } = state.data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
          メニュー候補
        </h2>
        <div className="space-y-2">
          {menus.map((menu) => (
            <MenuCard
              key={menu.id ?? menu.name}
              menu={menu}
              isSelected={selectedMenuId === (menu.id ?? menu.name)}
              onSelect={() => setSelectedMenuId(menu.id ?? menu.name)}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
          返答文章
        </h2>
        <div className="space-y-2">
          {messages.map((msg, i) => (
            <MessageCard key={i} message={msg} />
          ))}
        </div>
      </div>

      <button
        disabled
        className={`${primaryButtonClass} mt-2`}
      >
        記録する（近日公開）
      </button>
    </div>
  );
}
