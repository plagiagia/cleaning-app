"use client";

import { useMemo, useState } from "react";
import {
  formatLongDate,
  getAvailabilityForDate,
  getUpcomingDays,
  SERVICES,
} from "@/lib/data";
import { BottomBar } from "./bottom-bar";
import { DatePicker } from "./date-picker";
import { ServiceCatalogue } from "./service-catalogue";
import { TimeSlots } from "./time-slots";

export function BookingApp() {
  const days = useMemo(() => getUpcomingDays(14), []);
  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const availability = useMemo(
    () => getAvailabilityForDate(selectedDate),
    [selectedDate],
  );

  const selectedService = SERVICES.find((s) => s.id === selectedServiceId) ?? null;
  const selectedSlot = availability.slots.find((s) => s.id === selectedSlotId) ?? null;
  const firstAvailableSlot = availability.slots.find((s) => s.available);

  const effectiveSlotId =
    selectedSlot?.available ? selectedSlotId : firstAvailableSlot?.id ?? null;
  const effectiveSlot = availability.slots.find((s) => s.id === effectiveSlotId) ?? null;

  const canContinue = Boolean(
    selectedService &&
      availability.serviceIds.includes(selectedService.id) &&
      effectiveSlot?.available,
  );

  function handleDateSelect(date: Date) {
    setSelectedDate(date);
    setSelectedSlotId(null);
    setSelectedServiceId(null);
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-sky-50 via-white to-teal-50/40">
      <header className="sticky top-0 z-10 border-b border-white/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-md px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-sky-400 text-xl shadow-md shadow-teal-500/20">
              🫧
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
                Καθαριότητα σπιτιού
              </p>
              <h1 className="text-xl font-bold text-slate-900">S.cleaning</h1>
            </div>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Κλείστε καθαρισμό σε λίγα λεπτά. Επιλέξτε ημερομηνία, ώρα και υπηρεσία με διαφανείς
            τιμές.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-8 px-4 pb-36 pt-6">
        <DatePicker days={days} selectedDate={selectedDate} onSelect={handleDateSelect} />

        <TimeSlots
          slots={availability.slots}
          selectedSlotId={effectiveSlotId}
          onSelect={setSelectedSlotId}
        />

        <ServiceCatalogue
          services={SERVICES}
          availableIds={availability.serviceIds}
          selectedServiceId={selectedServiceId}
          onSelect={setSelectedServiceId}
        />

        <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <h2 className="font-semibold text-slate-900">Τι περιλαμβάνεται</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li className="flex gap-2">
              <span className="text-teal-500">✓</span>
              Όλα τα καθαριστικά συμπεριλαμβάνονται
            </li>
            <li className="flex gap-2">
              <span className="text-teal-500">✓</span>
              Διαφανείς τιμές — χωρίς κρυφές χρεώσεις
            </li>
            <li className="flex gap-2">
              <span className="text-teal-500">✓</span>
              Δωρεάν αλλαγή έως 16 ώρες πριν
            </li>
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <h2 className="font-semibold text-slate-900">Επικοινωνία</h2>
          <ul className="mt-3 space-y-3 text-sm text-slate-600">
            <li className="flex gap-2">
              <span className="text-teal-500">📍</span>
              <span>Νέα Πλαγιά, Χαλκιδική</span>
            </li>
            <li className="flex gap-2">
              <span className="text-teal-500">📞</span>
              <a href="tel:+306970122412" className="text-teal-600 hover:underline">
                697 012 2412
              </a>
            </li>
            <li className="flex gap-2">
              <span className="text-teal-500">✉️</span>
              <a
                href="mailto:s.cleaning2025@yahoo.com"
                className="text-teal-600 hover:underline"
              >
                s.cleaning2025@yahoo.com
              </a>
            </li>
          </ul>
        </section>
      </main>

      <BottomBar
        service={selectedService}
        dateLabel={formatLongDate(selectedDate)}
        timeLabel={effectiveSlot?.label ?? null}
        canContinue={canContinue}
      />
    </div>
  );
}
