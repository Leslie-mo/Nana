"use client";

import { localeLabels } from "@/i18n/messages";
import type { Locale } from "@/types";

export function LanguageSwitch({
  locale,
  onChange,
}: {
  locale: Locale;
  onChange: (locale: Locale) => void;
}) {
  return (
    <div className="flex rounded-full bg-mist p-1" aria-label="Language">
      {(Object.keys(localeLabels) as Locale[]).map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={`min-w-8 rounded-full px-2 py-1 text-[11px] font-bold transition ${
            locale === item ? "bg-white text-cocoa shadow-sm" : "text-stone-400"
          }`}
        >
          {localeLabels[item]}
        </button>
      ))}
    </div>
  );
}
