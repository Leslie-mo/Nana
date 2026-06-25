"use client";

import { ChevronDown, Settings, Sparkles } from "lucide-react";
import type { Locale } from "@/types";
import { useAppContext } from "./AppContext";

export function AppHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
  locale?: Locale;
  onLocaleChange?: (locale: Locale) => void;
}) {
  const { activePet, openPetSwitcher, openSettings } = useAppContext();
  const hasPetImage = Boolean(activePet.avatarImageUrl);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-cream/90 px-5 pb-3 pt-4 backdrop-blur-xl">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-cocoa text-white">
            <Sparkles size={16} />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-extrabold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-0.5 truncate text-[11px] text-stone-500">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="ml-3 flex shrink-0 items-center gap-2">
        <button
          onClick={openPetSwitcher}
          className="flex items-center gap-1.5 rounded-full bg-white py-1.5 pl-1.5 pr-2.5 text-xs font-bold shadow-sm"
        >
          {hasPetImage ? (
            <span
              className="h-7 w-7 rounded-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${activePet.avatarImageUrl})`,
                backgroundSize: activePet.isAiAvatar ? "cover" : "200% auto",
                backgroundPosition: activePet.isAiAvatar ? "center" : "100% 100%",
              }}
            />
          ) : (
            <span className="grid h-7 w-7 place-items-center rounded-full bg-sand/60 text-cocoa">
              <Sparkles size={13} />
            </span>
          )}
          {activePet.name}
          <ChevronDown size={13} className="text-stone-400" />
        </button>
        <button
          onClick={openSettings}
          className="grid h-9 w-9 place-items-center rounded-full bg-white text-stone-500 shadow-sm"
          aria-label="Settings"
        >
          <Settings size={17} />
        </button>
      </div>
    </header>
  );
}
