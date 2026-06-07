"use client";

import { useMemo, useState } from "react";
import type { MealLogForHistory } from "@/lib/types/home";
import DayDetail from "./DayDetail";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
}

type Props = {
  logs: MealLogForHistory[];
};

export default function CalendarView({ logs }: Props) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const logsByDate = useMemo(() => {
    return logs.reduce<Record<string, MealLogForHistory[]>>((acc, log) => {
      (acc[log.eaten_at] ??= []).push(log);
      return acc;
    }, {});
  }, [logs]);

  const calendarDays = getCalendarDays(currentYear, currentMonth);
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDate(null);
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDate(null);
  }

  function handleDayClick(day: number) {
    const key = toDateKey(currentYear, currentMonth, day);
    if (!logsByDate[key]) return;
    setSelectedDate((prev) => (prev === key ? null : key));
  }

  return (
    <div className="space-y-4">
      {/* 月ナビゲーション */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            ‹
          </button>
          <span className="text-sm font-semibold text-gray-700">
            {currentYear}年{currentMonth + 1}月
          </span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            ›
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((wd, i) => (
            <div
              key={wd}
              className={`text-center text-xs font-medium py-1 ${
                i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"
              }`}
            >
              {wd}
            </div>
          ))}
        </div>

        {/* 日付グリッド */}
        <div className="grid grid-cols-7 gap-y-1">
          {calendarDays.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} />;
            }

            const key = toDateKey(currentYear, currentMonth, day);
            const hasLog = !!logsByDate[key];
            const isToday = key === todayKey;
            const isSelected = key === selectedDate;
            const colIndex = i % 7;

            return (
              <button
                key={key}
                onClick={() => handleDayClick(day)}
                disabled={!hasLog}
                className={`
                  relative flex flex-col items-center justify-center
                  h-10 w-full rounded-lg text-sm transition-all
                  ${isSelected ? "bg-orange-100 ring-2 ring-orange-400 font-semibold text-orange-700" : ""}
                  ${!isSelected && isToday ? "border border-gray-300 font-semibold text-gray-700" : ""}
                  ${!isSelected && !isToday && hasLog ? "text-gray-800 hover:bg-orange-50 cursor-pointer" : ""}
                  ${!hasLog ? "text-gray-300 cursor-default" : ""}
                  ${colIndex === 0 && !isSelected && !isToday ? "text-red-400" : ""}
                  ${colIndex === 6 && !isSelected && !isToday ? "text-blue-400" : ""}
                `}
              >
                <span>{day}</span>
                {hasLog && (
                  <span className={`text-[8px] leading-none mt-0.5 ${isSelected ? "text-orange-500" : "text-orange-400"}`}>
                    ●
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 選択日の詳細 */}
      {selectedDate && logsByDate[selectedDate] && (
        <DayDetail date={selectedDate} logs={logsByDate[selectedDate]} />
      )}
    </div>
  );
}
