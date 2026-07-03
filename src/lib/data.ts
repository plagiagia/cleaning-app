import type { DayAvailability, Service } from "./types";

export const SERVICES: Service[] = [
  {
    id: "standard",
    name: "Standard Clean",
    description: "Dusting, vacuuming, kitchen & bathroom wipe-down.",
    duration: "2–3 hrs",
    price: 89,
    emoji: "✨",
    tag: "Popular",
  },
  {
    id: "deep",
    name: "Deep Clean",
    description: "Detailed scrubbing, inside appliances, hard-to-reach spots.",
    duration: "4–5 hrs",
    price: 149,
    emoji: "🧼",
  },
  {
    id: "move-out",
    name: "Move-out Clean",
    description: "Full top-to-bottom clean for handing back keys.",
    duration: "5–6 hrs",
    price: 199,
    emoji: "📦",
  },
  {
    id: "kitchen",
    name: "Kitchen Focus",
    description: "Counters, cabinets, oven, fridge & floor deep clean.",
    duration: "2–3 hrs",
    price: 79,
    emoji: "🍳",
  },
  {
    id: "windows",
    name: "Window Cleaning",
    description: "Interior windows, frames & sills — per visit.",
    duration: "1–2 hrs",
    price: 59,
    emoji: "🪟",
  },
  {
    id: "office",
    name: "Office Clean",
    description: "Desks, common areas & restrooms for small offices.",
    duration: "2–4 hrs",
    price: 119,
    emoji: "💼",
  },
];

const ALL_SERVICE_IDS = SERVICES.map((s) => s.id);

const TIME_TEMPLATES = [
  { id: "08:00", label: "8:00 AM" },
  { id: "10:00", label: "10:00 AM" },
  { id: "12:00", label: "12:00 PM" },
  { id: "14:00", label: "2:00 PM" },
  { id: "16:00", label: "4:00 PM" },
  { id: "18:00", label: "6:00 PM" },
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

function unavailableServiceIds(date: Date): string[] {
  const day = date.getDay();
  const seed = date.getDate();

  if (day === 0) return ALL_SERVICE_IDS.filter((id) => id !== "standard");
  if (seed % 9 === 0) return ALL_SERVICE_IDS.filter((id) => id !== "move-out" && id !== "office");
  if (day === 6) return ALL_SERVICE_IDS.filter((id) => id !== "office");

  return ALL_SERVICE_IDS;
}

export function getAvailabilityForDate(date: Date): DayAvailability {
  const blocked = unavailableSlotIds(date);
  const dateKey = toDateKey(date);

  return {
    date: dateKey,
    slots: TIME_TEMPLATES.map((slot) => ({
      ...slot,
      available: !blocked.has(slot.id),
    })),
    serviceIds: unavailableServiceIds(date),
  };
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { weekday: "short" });
}

export function formatDayNumber(date: Date): string {
  return String(date.getDate());
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
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
