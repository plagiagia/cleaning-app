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

const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE_BYTES = 4 * 1024 * 1024;

export type BookingFormData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  photos: { name: string; type: string; data: string }[];
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
  Record<"firstName" | "lastName" | "phone" | "email" | "location" | "photos", string>
>;

type PhotoPreview = {
  id: string;
  name: string;
  type: string;
  data: string;
  previewUrl: string;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
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
      setPosition(null);
      setPhotos((current) => {
        current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
        return [];
      });
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

    return nextErrors;
  }

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    const remainingSlots = MAX_PHOTOS - photos.length;
    if (remainingSlots <= 0) {
      setErrors((current) => ({ ...current, photos: t("formPhotoLimit") }));
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);
    const nextPhotos: PhotoPreview[] = [];

    for (const file of filesToAdd) {
      if (!file.type.startsWith("image/")) {
        setErrors((current) => ({ ...current, photos: t("formPhotoType") }));
        continue;
      }
      if (file.size > MAX_PHOTO_SIZE_BYTES) {
        setErrors((current) => ({ ...current, photos: t("formPhotoSize") }));
        continue;
      }

      const data = await fileToBase64(file);
      nextPhotos.push({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        data,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (nextPhotos.length > 0) {
      setPhotos((current) => [...current, ...nextPhotos]);
      setErrors((current) => ({ ...current, photos: undefined }));
    }
  }

  function removePhoto(id: string) {
    setPhotos((current) => {
      const photo = current.find((item) => item.id === id);
      if (photo) {
        URL.revokeObjectURL(photo.previewUrl);
      }
      return current.filter((item) => item.id !== id);
    });
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
      latitude: position.lat,
      longitude: position.lng,
      photos: photos.map(({ name, type, data }) => ({ name, type, data })),
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
              <p className="mb-1 text-sm font-medium text-slate-700">{t("formPhotos")}</p>
              <p className="mb-2 text-xs text-slate-500">{t("formPhotosHint")}</p>

              {photos.length > 0 ? (
                <ul className="mb-3 grid grid-cols-3 gap-2">
                  {photos.map((photo) => (
                    <li key={photo.id} className="relative aspect-square overflow-hidden rounded-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.previewUrl}
                        alt={photo.name}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-xs text-white"
                        aria-label={t("formRemovePhoto")}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}

              {photos.length < MAX_PHOTOS ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-xl border border-dashed border-slate-300 px-3 py-3 text-sm text-slate-600 hover:border-teal-400 hover:text-teal-600"
                >
                  {t("formAddPhotos")}
                </button>
              ) : null}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoChange}
              />

              {errors.photos ? (
                <p className="mt-1 text-xs text-coral-700">{errors.photos}</p>
              ) : null}
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
