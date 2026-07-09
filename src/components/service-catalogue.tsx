"use client";

import type { Service } from "@/lib/types";
import { ServiceCard } from "./service-card";

type ServiceCatalogueProps = {
  services: Service[];
  availableIds: string[];
  selectedServiceId: string | null;
  onSelect: (id: string) => void;
};

export function ServiceCatalogue({
  services,
  availableIds,
  selectedServiceId,
  onSelect,
}: ServiceCatalogueProps) {
  return (
    <section aria-label="Κατάλογος υπηρεσιών">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Υπηρεσίες</h2>
        <span className="text-sm text-slate-500">{availableIds.length} διαθέσιμες</span>
      </div>

      <div className="space-y-3">
        {services.map((service) => {
          const isAvailable = availableIds.includes(service.id);

          return (
            <ServiceCard
              key={service.id}
              service={service}
              selected={service.id === selectedServiceId}
              disabled={!isAvailable}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    </section>
  );
}
