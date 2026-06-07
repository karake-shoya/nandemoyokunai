"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { MealLogForHistory } from "@/lib/types/home";
import DayDetail from "./DayDetail";
import { monthKey } from "@/lib/date";

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
  initialYear: number;
  initialMonth: number;
};

export default function CalendarView({ logs, initialYear, initialMonth }: Props) {
  const router = useRouter();
  const today = new Date();
  const currentYear = initialYear;
  const currentMonth = initialMonth;
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
    const newYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    router.push(`/history?month=${monthKey(newYear, newMonth)}`);
    setSelectedDate(null);
  }

  function nextMonth() {
    const newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    router.push(`/history?month=${monthKey(newYear, newMonth)}`);
    setSelectedDate(null);
  }

  function handleDayClick(day: number) {
    const key = toDateKey(currentYear, currentMonth, day);
    if (!logsByDate[key]) return;
    setSelectedDate((prev) => (prev === key ? null : key));
  }

  return (
    <div className="space-y-4">
      <div className="bg-surface rounded-2xl border border-edge p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-haze text-mist transition-colors"
          >
            ‹
          </button>
          <span className="text-sm font-semibold text-parchment">
            {currentYear}年{currentMonth + 1}月
          </span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-haze text-mist transition-colors"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((wd, i) => (
            <div
              key={wd}
              className={`text-center text-xs font-medium py-1 ${
                i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-cinder"
              }`}
            >
              {wd}
            </div>
          ))}
        </div>

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
                  ${isSelected ? "bg-coal ring-1 ring-ember font-semibold text-ember" : ""}
                  ${!isSelected && isToday ? "border border-rim font-semibold text-parchment" : ""}
                  ${!isSelected && !isToday && hasLog ? "text-parchment hover:bg-haze cursor-pointer" : ""}
                  ${!hasLog ? "text-cinder cursor-default" : ""}
                  ${colIndex === 0 && !isSelected && !isToday ? "text-red-400" : ""}
                  ${colIndex === 6 && !isSelected && !isToday ? "text-blue-400" : ""}
                `}
              >
                <span>{day}</span>
                {hasLog && (
                  <span
                    className={`text-[8px] leading-none mt-0.5 ${
                      isSelected ? "text-ember" : "text-ember/60"
                    }`}
                  >
                    ●
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && logsByDate[selectedDate] && (
        <DayDetail
          date={selectedDate}
          logs={logsByDate[selectedDate]}
          onDateChange={setSelectedDate}
        />
      )}
    </div>
  );
}
