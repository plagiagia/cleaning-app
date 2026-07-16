"use client";

import dynamic from "next/dynamic";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "@/lib/i18n/context";
import type { Service } from "@/lib/types";

const LocationMap = dynamic(
  () => import("./location-map").then((mod) => mod.LocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-48 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500">
        …
      </div>
    ),
  },
);

export type BookingFormData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  comments: string;
  latitude: number;
  longitude: number;
};

type BookingModalProps = {
  isOpen: boolean;
  service: Service;
  dateLabel: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: BookingFormData) => void;
};

type FormErrors = Partial<
  Record<"firstName" | "lastName" | "phone" | "email" | "address" | "location", string>
>;

export function BookingModal({
  isOpen,
  service,
  dateLabel,
  isSubmitting,
  onClose,
  onSubmit,
}: BookingModalProps) {
  const { t } = useTranslations();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [comments, setComments] = useState("");
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, isSubmitting, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setFirstName("");
      setLastName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setComments("");
      setPosition(null);
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};

    if (!firstName.trim()) {
      nextErrors.firstName = t("formRequired");
    }
    if (!lastName.trim()) {
      nextErrors.lastName = t("formRequired");
    }
    if (!phone.trim()) {
      nextErrors.phone = t("formRequired");
    }
    if (!email.trim()) {
      nextErrors.email = t("formRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = t("formInvalidEmail");
    }
    if (!position) {
      nextErrors.location = t("formLocationRequired");
    }
    if (!address.trim()) {
      nextErrors.address = t("formAddressRequired");
    }

    return nextErrors;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !position) {
      return;
    }

    onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      comments: comments.trim(),
      latitude: position.lat,
      longitude: position.lng,
    });
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && !isSubmitting) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-slate-900">
              {t("formTitle")}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {service.emoji ? `${service.emoji} ` : ""}
              {service.name} · {dateLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
            aria-label={t("formCancel")}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-4 overflow-y-auto px-5 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-slate-700">
                  {t("formFirstName")}
                </label>
                <input
                  id="firstName"
                  name="first_name"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-teal-500 focus:ring-2"
                />
                {errors.firstName ? (
                  <p className="mt-1 text-xs text-coral-700">{errors.firstName}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-slate-700">
                  {t("formLastName")}
                </label>
                <input
                  id="lastName"
                  name="last_name"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-teal-500 focus:ring-2"
                />
                {errors.lastName ? (
                  <p className="mt-1 text-xs text-coral-700">{errors.lastName}</p>
                ) : null}
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
                {t("formPhone")}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-teal-500 focus:ring-2"
              />
              {errors.phone ? (
                <p className="mt-1 text-xs text-coral-700">{errors.phone}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                {t("formEmail")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-teal-500 focus:ring-2"
              />
              {errors.email ? (
                <p className="mt-1 text-xs text-coral-700">{errors.email}</p>
              ) : null}
            </div>

            <div>
              <p className="mb-1 text-sm font-medium text-slate-700">{t("formLocation")}</p>
              <LocationMap
                position={position}
                onPositionChange={setPosition}
                hint={t("formLocationHint")}
              />
              {errors.location ? (
                <p className="mt-1 text-xs text-coral-700">{errors.location}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="address" className="mb-1 block text-sm font-medium text-slate-700">
                {t("formAddress")}
              </label>
              <input
                id="address"
                name="address"
                type="text"
                autoComplete="street-address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder={t("formAddress")}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-teal-500 focus:ring-2"
              />
              {errors.address ? (
                <p className="mt-1 text-xs text-coral-700">{errors.address}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="comments" className="mb-1 block text-sm font-medium text-slate-700">
                {t("formComments")}
              </label>
              <p className="mb-2 text-xs text-slate-500">{t("formCommentsHint")}</p>
              <textarea
                id="comments"
                name="comments"
                rows={3}
                value={comments}
                onChange={(event) => setComments(event.target.value)}
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-teal-500 focus:ring-2"
              />
            </div>
          </div>

          <div className="flex gap-3 border-t border-slate-100 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {t("formCancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-2xl bg-teal-500 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? t("saving") : t("formSubmit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
