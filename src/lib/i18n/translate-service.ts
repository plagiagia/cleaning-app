import type { Service } from "@/lib/types";
import type { Locale, ServiceSlug } from "./types";
import { translations } from "./translations";

export function translateService(service: Service, locale: Locale): Service {
  const slug = service.slug as ServiceSlug;
  const translated = translations[locale].services[slug];

  if (!translated) {
    return service;
  }

  return {
    ...service,
    name: translated.name,
    description: translated.description,
  };
}

export function translateServices(services: Service[], locale: Locale): Service[] {
  return services.map((service) => translateService(service, locale));
}
