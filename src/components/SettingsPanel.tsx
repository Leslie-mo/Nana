"use client";

import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Database,
  Download,
  Languages,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { Locale, PetProfile } from "@/types";
import { LanguageSwitch } from "./LanguageSwitch";

const toggleItems = [
  { key: "settings.dailySummary", icon: Bell, initial: true },
  { key: "settings.healthAlerts", icon: ShieldCheck, initial: true },
  { key: "settings.autoMemories", icon: Sparkles, initial: true },
  { key: "settings.cloudSync", icon: Cloud, initial: false },
  { key: "settings.aiConsent", icon: Database, initial: true },
  { key: "settings.privateMode", icon: Lock, initial: false },
] as const;

export function SettingsPanel({
  locale,
  onLocaleChange,
  activePet,
  onClose,
  t,
}: {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  activePet: PetProfile;
  onClose: () => void;
  t: (key: string) => string;
}) {
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(toggleItems.map((item) => [item.key, item.initial])),
  );

  return (
    <div className="absolute inset-0 z-[80] flex flex-col bg-cream">
      <header className="flex items-center gap-3 px-5 pb-4 pt-5">
        <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-black">{t("settings.title")}</h1>
          <p className="mt-0.5 text-[10px] text-stone-400">{t("settings.subtitle")}</p>
        </div>
      </header>

      <main className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-4 pb-8">
        <section className="rounded-[26px] bg-white p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <span
              className="h-14 w-14 rounded-[18px] bg-cover bg-center"
              style={{
                backgroundImage: `url(${activePet.avatarImageUrl})`,
                backgroundSize: activePet.isAiAvatar ? "cover" : "200% auto",
                backgroundPosition: activePet.isAiAvatar ? "center" : "100% 100%",
              }}
            />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-cocoa">{t("settings.currentPet")}</p>
              <h2 className="mt-1 font-black">{activePet.name}</h2>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-2 px-2 text-xs font-bold text-stone-400">{t("settings.general")}</h2>
          <div className="rounded-[26px] bg-white p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sand/45 text-cocoa">
                <Languages size={18} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold">{t("settings.language")}</p>
                <p className="mt-0.5 text-[10px] text-stone-400">{t("settings.languageHint")}</p>
              </div>
              <LanguageSwitch locale={locale} onChange={onLocaleChange} />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-2 px-2 text-xs font-bold text-stone-400">{t("settings.intelligence")}</h2>
          <div className="divide-y divide-stone-100 overflow-hidden rounded-[26px] bg-white px-4 shadow-soft">
            {toggleItems.map(({ key, icon: Icon }) => (
              <div key={key} className="flex items-center gap-3 py-4">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-sand/35 text-cocoa">
                  <Icon size={17} />
                </span>
                <span className="flex-1 text-sm font-semibold">{t(key)}</span>
                <button
                  onClick={() => setToggles((value) => ({ ...value, [key]: !value[key] }))}
                  className={`relative h-7 w-12 rounded-full transition ${toggles[key] ? "bg-cocoa" : "bg-stone-200"}`}
                >
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${toggles[key] ? "left-6" : "left-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 px-2 text-xs font-bold text-stone-400">{t("settings.data")}</h2>
          <div className="divide-y divide-stone-100 overflow-hidden rounded-[26px] bg-white px-4 shadow-soft">
            {[
              ["settings.manageAvatar", RefreshCw],
              ["settings.exportData", Download],
              ["settings.deleteProfile", Trash2],
            ].map(([key, Icon]) => (
              <button key={key as string} className="flex w-full items-center gap-3 py-4 text-left">
                <span className={`grid h-9 w-9 place-items-center rounded-xl ${(key as string) === "settings.deleteProfile" ? "bg-rose-50 text-rose-500" : "bg-sand/35 text-cocoa"}`}>
                  <Icon size={17} />
                </span>
                <span className={`flex-1 text-sm font-semibold ${(key as string) === "settings.deleteProfile" ? "text-rose-500" : ""}`}>{t(key as string)}</span>
                <ChevronRight size={16} className="text-stone-300" />
              </button>
            ))}
          </div>
        </section>

        <p className="text-center text-[10px] leading-5 text-stone-400">
          Pet Digital Twin<br />Demo 1.0.0
        </p>
      </main>
    </div>
  );
}
