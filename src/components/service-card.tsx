"use client";

import type { Service } from "@/lib/types";

type ServiceCardProps = {
  service: Service;
  selected: boolean;
  disabled?: boolean;
  onSelect: (id: string) => void;
};

export function ServiceCard({ service, selected, disabled, onSelect }: ServiceCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(service.id)}
      className={`w-full rounded-2xl border p-4 text-left transition-all active:scale-[0.99] ${
        disabled
          ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-60"
          : selected
            ? "border-teal-400 bg-teal-50 shadow-md shadow-teal-500/10 ring-2 ring-teal-400"
            : "border-slate-200 bg-white hover:border-teal-200 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-2xl">
          {service.emoji ?? "✨"}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900">{service.name}</h3>

          {service.description ? (
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{service.description}</p>
          ) : null}

          <p className="mt-2 text-xs font-medium text-teal-600">Κατόπιν συνεννόησης</p>
        </div>
      </div>
    </button>
  );
}
