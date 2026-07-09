export type Locale = "el" | "en" | "bg" | "mk" | "sr";

export type TranslationKey =
  | "logoAlt"
  | "intro"
  | "pickDate"
  | "workingDays"
  | "today"
  | "pickDateAria"
  | "servicesTitle"
  | "servicesAvailable"
  | "servicesAria"
  | "uponConsultation"
  | "noServices"
  | "contact"
  | "location"
  | "selectService"
  | "booking"
  | "saving"
  | "bookingSuccess"
  | "bookingError"
  | "language"
  | "formTitle"
  | "formFirstName"
  | "formLastName"
  | "formPhone"
  | "formEmail"
  | "formLocation"
  | "formLocationHint"
  | "formPhotos"
  | "formPhotosHint"
  | "formAddPhotos"
  | "formRemovePhoto"
  | "formSubmit"
  | "formCancel"
  | "formRequired"
  | "formInvalidEmail"
  | "formLocationRequired"
  | "formPhotoLimit"
  | "formPhotoSize"
  | "formPhotoType"
  | "bookingEmailFailed";

export type ServiceSlug =
  | "myoktonies"
  | "apentomoseis"
  | "katharismos-tzamiwn"
  | "viologikos-katharismos"
  | "katharismos-neodmitwn"
  | "loipes-ypiresies";

export type ServiceTranslation = {
  name: string;
  description: string;
};

export type Translations = Record<TranslationKey, string> & {
  services: Record<ServiceSlug, ServiceTranslation>;
};

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "el", label: "Ελληνικά" },
  { code: "en", label: "English" },
  { code: "bg", label: "Български" },
  { code: "mk", label: "Македонски" },
  { code: "sr", label: "Српски" },
];

export const LOCALE_TAGS: Record<Locale, string> = {
  el: "el-GR",
  en: "en-GB",
  bg: "bg-BG",
  mk: "mk-MK",
  sr: "sr-RS",
};

export const DEFAULT_LOCALE: Locale = "el";
export const LOCALE_STORAGE_KEY = "s-cleaning-locale";
