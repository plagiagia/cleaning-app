"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { createBooking } from "@/app/actions/booking";
import { useTranslations } from "@/lib/i18n/context";
import { translateServices } from "@/lib/i18n/translate-service";
import {
  formatLongDate,
  getAvailabilityForDate,
  getUpcomingWorkingDays,
  toDateKey,
} from "@/lib/data";
import type { Service } from "@/lib/types";
import { BottomBar } from "./bottom-bar";
import { DatePicker } from "./date-picker";
import { LanguageSwitcher } from "./language-switcher";
import { ServiceCatalogue } from "./service-catalogue";

type BookingAppProps = {
  services: Service[];
};

type StatusMessage = {
  type: "success" | "error";
  text: string;
} | null;

export function BookingApp({ services }: BookingAppProps) {
  const { locale, t, localeTag } = useTranslations();
  const days = useMemo(() => getUpcomingWorkingDays(14), []);
  const translatedServices = useMemo(
    () => translateServices(services, locale),
    [services, locale],
  );
  const serviceIds = useMemo(
    () => translatedServices.map((service) => service.id),
    [translatedServices],
  );
  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedDateKey = toDateKey(selectedDate);

  const availability = useMemo(
    () => getAvailabilityForDate(selectedDate, serviceIds),
    [selectedDate, serviceIds],
  );

  const selectedService =
    translatedServices.find((service) => service.id === selectedServiceId) ?? null;

  const canContinue = Boolean(
    selectedService && availability.serviceIds.includes(selectedService.id),
  );

  function handleDateSelect(date: Date) {
    setSelectedDate(date);
    setSelectedServiceId(null);
    setStatusMessage(null);
  }

  async function handleContinue() {
    if (!selectedService) {
      return;
    }

    setStatusMessage(null);
    setIsSubmitting(true);

    try {
      const result = await createBooking({
        serviceId: selectedService.id,
        date: selectedDateKey,
      });

      if (result.ok) {
        setSelectedServiceId(null);
        setStatusMessage({ type: "success", text: t("bookingSuccess") });
        return;
      }

      setStatusMessage({ type: "error", text: t("bookingError") });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-sky-50 via-white to-teal-50/40">
      <header className="sticky top-0 z-10 border-b border-slate-200/60 bg-white">
        <div className="relative mx-auto max-w-md px-4 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <LanguageSwitcher />

          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt={t("logoAlt")}
              width={320}
              height={213}
              priority
              className="h-auto w-full max-w-[280px] object-contain"
            />
          </div>

          <p className="mt-3 text-center text-sm leading-relaxed text-slate-600">{t("intro")}</p>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-8 px-4 pb-36 pt-6">
        <DatePicker
          days={days}
          selectedDate={selectedDate}
          localeTag={localeTag}
          onSelect={handleDateSelect}
        />

        {translatedServices.length > 0 ? (
          <ServiceCatalogue
            services={translatedServices}
            availableIds={availability.serviceIds}
            selectedServiceId={selectedServiceId}
            onSelect={setSelectedServiceId}
          />
        ) : (
          <section className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
            {t("noServices")}
          </section>
        )}

        <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <h2 className="font-semibold text-slate-900">{t("contact")}</h2>
          <ul className="mt-3 space-y-3 text-sm text-slate-600">
            <li className="flex gap-2">
              <span className="text-teal-500">👤</span>
              <span>Βασίλης Μαυρουδάκης</span>
            </li>
            <li className="flex gap-2">
              <span className="text-teal-500">📍</span>
              <span>{t("location")}</span>
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
        dateLabel={formatLongDate(selectedDate, localeTag)}
        canContinue={canContinue}
        isSubmitting={isSubmitting}
        statusMessage={statusMessage}
        onContinue={handleContinue}
      />
    </div>
  );
}
