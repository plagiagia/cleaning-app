import type { DayAvailability } from "./types";

export function isWorkingDay(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 6;
}

export function getAvailabilityForDate(date: Date, serviceIds: string[]): DayAvailability {
  return {
    date: toDateKey(date),
    serviceIds: isWorkingDay(date) ? serviceIds : [],
  };
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatShortDate(date: Date, localeTag = "el-GR"): string {
  return date.toLocaleDateString(localeTag, { weekday: "short" });
}

export function formatDayNumber(date: Date): string {
  return String(date.getDate());
}

export function formatLongDate(date: Date, localeTag = "el-GR"): string {
  return date.toLocaleDateString(localeTag, {
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
