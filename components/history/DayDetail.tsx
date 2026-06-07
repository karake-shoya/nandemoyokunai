import type { MealLogForHistory } from "@/lib/types/home";
import { COOKED_BY_LABELS } from "@/lib/types/home";

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日（${"日月火水木金土"[d.getDay()]}）`;
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
      <ul className="space-y-2">
        {logs.map((log) => (
          <li key={log.id} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {log.menus?.name ?? "不明なメニュー"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {COOKED_BY_LABELS[log.cooked_by]}
                {log.memo && <span className="ml-2">— {log.memo}</span>}
              </p>
            </div>
            {log.menus?.category && (
              <span className="shrink-0 rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-600">
                {log.menus.category}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
