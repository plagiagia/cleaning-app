import type { DayAvailability, Service } from "./types";

export const SERVICES: Service[] = [
  {
    id: "standard",
    name: "Τυπικός καθαρισμός",
    description: "Σκούπισμα, απορρόφηση, καθάρισμα κουζίνας και μπάνιου.",
    duration: "2–3 ώρες",
    price: 89,
    emoji: "✨",
    tag: "Δημοφιλές",
  },
  {
    id: "deep",
    name: "Βαθύς καθαρισμός",
    description: "Λεπτομερές τρίψιμο, εσωτερικά συσκευών, δύσκολα σημεία.",
    duration: "4–5 ώρες",
    price: 149,
    emoji: "🧼",
  },
  {
    id: "move-out",
    name: "Καθαρισμός μετά από μετακόμιση",
    description: "Πλήρης καθαρισμός από πάνω μέχρι κάτω για παράδοση κλειδιών.",
    duration: "5–6 ώρες",
    price: 199,
    emoji: "📦",
  },
  {
    id: "kitchen",
    name: "Εστίαση κουζίνας",
    description: "Πάγκοι, ντουλάπια, φούρνος, ψυγείο και δάπεδο.",
    duration: "2–3 ώρες",
    price: 79,
    emoji: "🍳",
  },
  {
    id: "windows",
    name: "Καθαρισμός παραθύρων",
    description: "Εσωτερικά παράθυρα, κουφώματα και κάγκελα — ανά επίσκεψη.",
    duration: "1–2 ώρες",
    price: 59,
    emoji: "🪟",
  },
  {
    id: "office",
    name: "Καθαρισμός γραφείου",
    description: "Γραφεία, κοινόχρηστοι χώροι και τουαλέτες για μικρά γραφεία.",
    duration: "2–4 ώρες",
    price: 119,
    emoji: "💼",
  },
];

const ALL_SERVICE_IDS = SERVICES.map((s) => s.id);

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
