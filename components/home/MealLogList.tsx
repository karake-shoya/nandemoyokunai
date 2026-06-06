import type { MealLogWithMenu } from "@/lib/types/home";
import { COOKED_BY_LABELS } from "@/lib/types/home";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}（${"日月火水木金土"[d.getDay()]}）`;
}

export default function MealLogList({ logs }: { logs: MealLogWithMenu[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
        最近の食事
      </h3>

      {logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-3xl mb-2">🍱</p>
          <p className="text-sm text-gray-400">まだ記録がありません</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {logs.map((log) => (
            <li key={log.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {log.menus?.name ?? "不明なメニュー"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {COOKED_BY_LABELS[log.cooked_by]}
                </p>
              </div>
              <span className="text-xs text-gray-400 shrink-0 ml-4">
                {formatDate(log.eaten_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
