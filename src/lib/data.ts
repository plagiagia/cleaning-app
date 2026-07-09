import type { DayAvailability } from "./types";

const TIME_TEMPLATES = [
  { id: "08:00", label: "08:00" },
  { id: "10:00", label: "10:00" },
  { id: "12:00", label: "12:00" },
  { id: "14:00", label: "14:00" },
  { id: "16:00", label: "16:00" },
  { id: "18:00", label: "18:00" },
];

function unavailableSlotIds(date: Date): Set<string> {
  const day = date.getDay();
  const seed = date.getDate() + date.getMonth() * 3;

  if (day === 0) return new Set(["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"]);
  if (day === 6) return new Set(["18:00"]);
  if (seed % 7 === 0) return new Set(["10:00", "14:00"]);
  if (seed % 5 === 0) return new Set(["16:00", "18:00"]);

  return new Set();
}

export function getAvailabilityForDate(date: Date, serviceIds: string[]): DayAvailability {
  const blocked = unavailableSlotIds(date);
  const dateKey = toDateKey(date);

  return {
    date: dateKey,
    slots: TIME_TEMPLATES.map((slot) => ({
      ...slot,
      available: !blocked.has(slot.id),
    })),
    serviceIds,
  };
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("el-GR", { weekday: "short" });
}

export function formatDayNumber(date: Date): string {
  return String(date.getDate());
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString("el-GR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function getUpcomingDays(count = 14): Date[] {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }

  return days;
}

export function applyBookedSlots(
  availability: DayAvailability,
  bookedSlotIds: string[],
): DayAvailability {
  const booked = new Set(bookedSlotIds);

  return {
    ...availability,
    slots: availability.slots.map((slot) => ({
      ...slot,
      available: slot.available && !booked.has(slot.id),
    })),
  };
}
