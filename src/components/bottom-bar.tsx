"use client";

import type { Service } from "@/lib/types";

type BottomBarProps = {
  service: Service | null;
  dateLabel: string;
  timeLabel: string | null;
  canContinue: boolean;
};

export function BottomBar({ service, dateLabel, timeLabel, canContinue }: BottomBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-md px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mb-3 flex items-center justify-between gap-3 text-sm">
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">
              {service ? service.name : "Select a service"}
            </p>
            <p className="truncate text-slate-500">
              {dateLabel}
              {timeLabel ? ` · ${timeLabel}` : ""}
            </p>
          </div>
          <p className="shrink-0 text-xl font-bold text-teal-600">
            {service ? `£${service.price}` : "—"}
          </p>
        </div>

        <button
          type="button"
          disabled={!canContinue}
          className={`w-full rounded-2xl py-4 text-base font-semibold transition-all active:scale-[0.99] ${
            canContinue
              ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30 hover:bg-teal-600"
              : "cursor-not-allowed bg-slate-200 text-slate-500"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
