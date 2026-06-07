"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MenuCard from "@/components/proposal/MenuCard";
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

type SelectedMenu = { id?: string; name: string; category: string };

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; data: SuggestResult };

export default function ProposalPage() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [selectedMenu, setSelectedMenu] = useState<SelectedMenu | null>(null);

  async function fetchSuggestion() {
    setState({ status: "loading" });
    setSelectedMenu(null);

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

      const result = json as SuggestResult;
      setState({ status: "done", data: result });

      sessionStorage.setItem(
        `messages-${result.sessionId}`,
        JSON.stringify(result.messages)
      );
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
        <div className="h-10 w-10 rounded-full border-2 border-edge border-t-ember animate-spin" />
        <p className="text-sm text-mist">AIが考えています...</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-3xl opacity-50">😢</p>
        <p className="text-sm text-mist text-center">{state.message}</p>
        <button
          onClick={fetchSuggestion}
          className="mt-2 rounded-xl bg-ember px-5 py-2.5 text-sm font-semibold text-white hover:bg-flame transition-colors"
        >
          もう一度試す
        </button>
      </div>
    );
  }

  const { sessionId, menus } = state.data;

  const recordHref = selectedMenu
    ? `/record?sessionId=${sessionId}&menuId=${selectedMenu.id ?? ""}&menuName=${encodeURIComponent(selectedMenu.name)}&menuCategory=${encodeURIComponent(selectedMenu.category)}`
    : null;

  return (
    <div className="space-y-6">
      <Link
        href="/home"
        className="inline-flex items-center gap-1 text-sm text-cinder hover:text-mist transition-colors"
      >
        ← ホームに戻る
      </Link>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-medium text-mist uppercase tracking-widest">
            メニュー候補
          </h2>
          <button
            onClick={fetchSuggestion}
            className="text-xs text-ember hover:text-flame transition-colors flex items-center gap-1"
          >
            <span>↺</span> 入れ替え
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {menus.map((menu) => (
            <MenuCard
              key={menu.id ?? menu.name}
              menu={menu}
              isSelected={selectedMenu?.name === menu.name}
              onSelect={() =>
                setSelectedMenu({ id: menu.id, name: menu.name, category: menu.category })
              }
            />
          ))}
        </div>
      </div>

      {recordHref ? (
        <Link href={recordHref} className={`${primaryButtonClass} block text-center mt-2`}>
          記録する
        </Link>
      ) : (
        <button disabled className={`${primaryButtonClass} mt-2`}>
          メニューを選んで記録する
        </button>
      )}
    </div>
  );
}
