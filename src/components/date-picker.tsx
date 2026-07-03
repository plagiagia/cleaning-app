"use client";

import { formatDayNumber, formatShortDate, toDateKey } from "@/lib/data";

type DatePickerProps = {
  days: Date[];
  selectedDate: Date;
  onSelect: (date: Date) => void;
};

export function DatePicker({ days, selectedDate, onSelect }: DatePickerProps) {
  const selectedKey = toDateKey(selectedDate);
  const todayKey = toDateKey(new Date());

  return (
    <section aria-label="Choose a date">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Pick a date</h2>
        <span className="text-sm text-slate-500">Next 2 weeks</span>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
        {days.map((day) => {
          const key = toDateKey(day);
          const isSelected = key === selectedKey;
          const isToday = key === todayKey;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(day)}
              className={`flex min-w-[4.5rem] shrink-0 flex-col items-center rounded-2xl border px-3 py-3 transition-all active:scale-95 ${
                isSelected
                  ? "border-teal-500 bg-teal-500 text-white shadow-md shadow-teal-500/25"
                  : "border-slate-200 bg-white text-slate-700 hover:border-teal-200"
              }`}
            >
              <span className={`text-xs font-medium ${isSelected ? "text-teal-100" : "text-slate-500"}`}>
                {isToday ? "Today" : formatShortDate(day)}
              </span>
              <span className="mt-1 text-xl font-bold leading-none">{formatDayNumber(day)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
