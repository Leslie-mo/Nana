"use client";

import { Activity, HeartPulse, MapPinned, Network, Sparkles, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  growthLogs,
  habitInsights,
  healthSignals,
  lifeMilestones,
  relationshipMap,
} from "@/data/mockData";
import { generateLifeArchive } from "@/lib/gemini";
import { AppHeader } from "./AppHeader";
import type { Locale } from "@/types";
import { useAppContext } from "./AppContext";

export function MemoryPage({
  locale,
  onLocaleChange,
  t,
}: {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  t: (key: string) => string;
}) {
  const { activePet } = useAppContext();

  return (
    <>
      <AppHeader title={t("archive.title")} subtitle={t("archive.subtitle")} locale={locale} onLocaleChange={onLocaleChange} />
      <main className="space-y-4 px-4 pb-28">
        <section className="rounded-[30px] bg-[#352D28] p-5 text-white shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-sand">{t("archive.aiGenerated")}</p>
              <h2 className="mt-2 text-2xl font-black">{activePet.name} {t("archive.lifeGraph")}</h2>
              <p className="mt-2 text-xs leading-5 text-white/60">{t("archive.heroCopy")}</p>
            </div>
            <button
              onClick={() => generateLifeArchive(activePet.id)}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-sand"
              aria-label={t("archive.refresh")}
            >
              <Sparkles size={20} />
            </button>
          </div>
        </section>

        <ArchiveCard icon={MapPinned} title={t("archive.milestoneTitle")}>
          <div className="relative space-y-4 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-sand">
            {lifeMilestones.map((item) => (
              <div key={item.id} className="relative flex gap-3">
                <span className="relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white bg-cocoa ring-2 ring-sand" />
                <div className="min-w-0 flex-1">
                  <time className="text-[10px] font-bold text-stone-400">{item.date}</time>
                  <p className="mt-0.5 text-sm font-bold">{t(item.titleKey)}</p>
                </div>
                {item.growthDelta && (
                  <span className="mt-2 shrink-0 rounded-full bg-sand/55 px-2.5 py-1 text-[10px] font-black text-cocoa">
                    +{item.growthDelta}
                  </span>
                )}
              </div>
            ))}
          </div>
        </ArchiveCard>

        <ArchiveCard icon={Activity} title={t("archive.habitTitle")}>
          <div className="grid gap-2">
            {habitInsights.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-3">
                <span className="min-w-0 flex-1 text-sm font-semibold text-stone-700">{t(item.textKey)}</span>
                {item.growthDelta && (
                  <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-cocoa shadow-sm">
                    +{item.growthDelta}
                  </span>
                )}
              </div>
            ))}
          </div>
        </ArchiveCard>

        <ArchiveCard icon={Network} title={t("archive.relationshipTitle")}>
          <div className="space-y-3">
            {relationshipMap.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3">
                <span className="text-xs font-bold text-stone-400">{t(item.labelKey)}</span>
                <span className="text-right text-sm font-black text-ink">{t(item.valueKey)}</span>
              </div>
            ))}
          </div>
        </ArchiveCard>

        <ArchiveCard icon={TrendingUp} title={t("archive.growthTitle")}>
          <div className="grid grid-cols-3 gap-2">
            {growthLogs.map((item) => (
              <div key={item.id} className="rounded-2xl bg-cream p-4 text-center">
                <p className="text-[10px] font-bold text-stone-400">{t(item.traitKey)}</p>
                <p className="mt-2 text-2xl font-black text-cocoa">+{item.delta}</p>
              </div>
            ))}
          </div>
        </ArchiveCard>

        <ArchiveCard icon={HeartPulse} title={t("archive.healthTitle")}>
          {healthSignals.map((item) => (
            <div key={item.id} className="rounded-[22px] bg-rose-50 p-4">
              <p className="text-sm font-bold text-rose-900">{t(item.textKey)}</p>
              <p className="mt-2 text-xs leading-5 text-rose-700">{t(item.adviceKey)}</p>
            </div>
          ))}
        </ArchiveCard>
      </main>
    </>
  );
}

function ArchiveCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-sand/45 text-cocoa">
          <Icon size={18} />
        </span>
        <h2 className="font-black">{title}</h2>
      </div>
      {children}
    </section>
  );
}
