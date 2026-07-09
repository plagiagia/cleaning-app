"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";
import { createBooking, getBookedTimeSlots } from "@/app/actions/booking";
import {
  applyBookedSlots,
  formatLongDate,
  getAvailabilityForDate,
  getUpcomingWorkingDays,
  toDateKey,
} from "@/lib/data";
import type { Service } from "@/lib/types";
import { BottomBar } from "./bottom-bar";
import { DatePicker } from "./date-picker";
import { ServiceCatalogue } from "./service-catalogue";
import { TimeSlots } from "./time-slots";

type BookingAppProps = {
  services: Service[];
};

export function BookingApp({ services }: BookingAppProps) {
  const days = useMemo(() => getUpcomingWorkingDays(14), []);
  const serviceIds = useMemo(() => services.map((service) => service.id), [services]);
  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [bookedSlotIds, setBookedSlotIds] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, startTransition] = useTransition();

  const selectedDateKey = toDateKey(selectedDate);

  useEffect(() => {
    let cancelled = false;

    startTransition(async () => {
      const slots = await getBookedTimeSlots(selectedDateKey);

      if (!cancelled) {
        setBookedSlotIds(slots);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedDateKey]);

  const availability = useMemo(() => {
    const base = getAvailabilityForDate(selectedDate, serviceIds);
    return applyBookedSlots(base, bookedSlotIds);
  }, [selectedDate, serviceIds, bookedSlotIds]);

  const selectedService = services.find((service) => service.id === selectedServiceId) ?? null;
  const selectedSlot = availability.slots.find((slot) => slot.id === selectedSlotId) ?? null;
  const firstAvailableSlot = availability.slots.find((slot) => slot.available);

  const effectiveSlotId =
    selectedSlot?.available ? selectedSlotId : firstAvailableSlot?.id ?? null;
  const effectiveSlot = availability.slots.find((slot) => slot.id === effectiveSlotId) ?? null;

  const canContinue = Boolean(
    selectedService &&
      availability.serviceIds.includes(selectedService.id) &&
      effectiveSlot?.available,
  );

  function handleDateSelect(date: Date) {
    setSelectedDate(date);
    setSelectedSlotId(null);
    setSelectedServiceId(null);
    setStatusMessage(null);
  }

  async function handleContinue() {
    if (!selectedService || !effectiveSlot) {
      return;
    }

    setStatusMessage(null);
    setIsSubmitting(true);

    try {
      const result = await createBooking({
        serviceId: selectedService.id,
        date: selectedDateKey,
        timeSlot: effectiveSlot.id,
      });

      if (result.ok) {
        setBookedSlotIds((current) =>
          current.includes(effectiveSlot.id) ? current : [...current, effectiveSlot.id],
        );
        setSelectedSlotId(null);
        setSelectedServiceId(null);
        setStatusMessage("Η κράτησή σας αποθηκεύτηκε με επιτυχία!");
        return;
      }

      setStatusMessage(result.error);
      const slots = await getBookedTimeSlots(selectedDateKey);
      setBookedSlotIds(slots);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-sky-50 via-white to-teal-50/40">
      <header className="sticky top-0 z-10 border-b border-slate-200/60 bg-white">
        <div className="mx-auto max-w-md px-4 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="S.cleaning — Υπηρεσίες Καθαρισμού"
              width={320}
              height={213}
              priority
              className="h-auto w-full max-w-[280px] object-contain"
            />
          </div>

          <p className="mt-3 text-center text-sm leading-relaxed text-slate-600">
            Κλείστε ραντεβού σε λίγα λεπτά. Επιλέξτε ημερομηνία, ώρα και υπηρεσία — η τιμή
            καθορίζεται κατόπιν συνεννόησης.
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

        {services.length > 0 ? (
          <ServiceCatalogue
            services={services}
            availableIds={availability.serviceIds}
            selectedServiceId={selectedServiceId}
            onSelect={setSelectedServiceId}
          />
        ) : (
          <section className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
            Δεν βρέθηκαν υπηρεσίες. Εκτελέστε{" "}
            <code className="rounded bg-slate-100 px-1">npm run db:push</code> και{" "}
            <code className="rounded bg-slate-100 px-1">npm run db:seed</code>.
          </section>
        )}

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
        isSubmitting={isSubmitting}
        statusMessage={statusMessage}
        onContinue={handleContinue}
      />
    </div>
  );
}
