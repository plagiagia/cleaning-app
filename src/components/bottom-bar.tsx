"use client";

import { useTranslations } from "@/lib/i18n/context";
import type { Service } from "@/lib/types";

type BottomBarProps = {
  service: Service | null;
  dateLabel: string;
  canContinue: boolean;
  isSubmitting: boolean;
  statusMessage: { type: "success" | "error"; text: string } | null;
  onContinue: () => void;
};

export function BottomBar({
  service,
  dateLabel,
  canContinue,
  isSubmitting,
  statusMessage,
  onContinue,
}: BottomBarProps) {
  const { t } = useTranslations();
  const isDisabled = !canContinue || isSubmitting;

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-md px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        {statusMessage ? (
          <p
            className={`mb-3 text-center text-sm ${
              statusMessage.type === "success" ? "text-teal-600" : "text-coral-700"
            }`}
          >
            {statusMessage.text}
          </p>
        ) : null}

        <div className="mb-3 text-sm">
          <p className="truncate font-medium text-slate-900">
            {service ? service.name : t("selectService")}
          </p>
          <p className="truncate text-slate-500">{dateLabel}</p>
        </div>

        <button
          type="button"
          disabled={isDisabled}
          onClick={onContinue}
          className={`w-full rounded-2xl py-4 text-base font-semibold transition-all active:scale-[0.99] ${
            !isDisabled
              ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30 hover:bg-teal-600"
              : "cursor-not-allowed bg-slate-200 text-slate-500"
          }`}
        >
          {isSubmitting ? t("saving") : t("booking")}
        </button>
      </div>
    </div>
  );
}
