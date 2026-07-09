import type { DayAvailability } from "./types";

const WORK_DAY_START_HOUR = 6;
const WORK_DAY_END_HOUR = 20;

const TIME_TEMPLATES = Array.from(
  { length: WORK_DAY_END_HOUR - WORK_DAY_START_HOUR + 1 },
  (_, index) => {
    const hour = WORK_DAY_START_HOUR + index;
    const id = `${String(hour).padStart(2, "0")}:00`;

    return { id, label: id };
  },
);

export function isWorkingDay(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 6;
}

function unavailableSlotIds(date: Date): Set<string> {
  if (!isWorkingDay(date)) {
    return new Set(TIME_TEMPLATES.map((slot) => slot.id));
  }

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
    serviceIds: isWorkingDay(date) ? serviceIds : [],
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

export function getUpcomingWorkingDays(count = 14): Date[] {
  const days: Date[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (days.length < count) {
    if (isWorkingDay(cursor)) {
      days.push(new Date(cursor));
    }

    cursor.setDate(cursor.getDate() + 1);
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
