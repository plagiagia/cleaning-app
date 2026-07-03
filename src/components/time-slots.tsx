"use client";

import type { TimeSlot } from "@/lib/types";

type TimeSlotsProps = {
  slots: TimeSlot[];
  selectedSlotId: string | null;
  onSelect: (slotId: string) => void;
};

export function TimeSlots({ slots, selectedSlotId, onSelect }: TimeSlotsProps) {
  const availableCount = slots.filter((s) => s.available).length;

  return (
    <section aria-label="Choose a time">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Available times</h2>
        <span className="text-sm text-slate-500">
          {availableCount === 0 ? "Fully booked" : `${availableCount} open`}
        </span>
      </div>

      {availableCount === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
          No slots left on this day. Try another date.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {slots.map((slot) => {
            const isSelected = slot.id === selectedSlotId;

            return (
              <button
                key={slot.id}
                type="button"
                disabled={!slot.available}
                onClick={() => onSelect(slot.id)}
                className={`rounded-full px-4 py-2.5 text-sm font-medium transition-all active:scale-95 ${
                  !slot.available
                    ? "cursor-not-allowed bg-slate-100 text-slate-400 line-through"
                    : isSelected
                      ? "bg-coral-500 text-white shadow-md shadow-coral-500/30"
                      : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-coral-200"
                }`}
              >
                {slot.label}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
