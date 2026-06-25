"use client";

import { useState } from "react";
import { Check, Clapperboard, Share2, Sparkles } from "lucide-react";
import { imagePositions } from "@/data/mockData";
import { generateLifeReplay } from "@/lib/gemini";
import { AppHeader } from "./AppHeader";
import type { Locale } from "@/types";
import { useAppContext } from "./AppContext";

export function ReplayPage({
  locale,
  onLocaleChange,
  t,
}: {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  t: (key: string) => string;
}) {
  const { activePet } = useAppContext();
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  async function generate() {
    if (status === "loading") return;
    setStatus("loading");
    await generateLifeReplay("2025.06-2026.06");
    setStatus("done");
  }

  const buttonText =
    status === "loading"
      ? t("replay.generating")
      : status === "done"
        ? t("replay.generated")
        : t("replay.generate");

  return (
    <>
      <AppHeader
        title={t("replay.title")}
        locale={locale}
        onLocaleChange={onLocaleChange}
      />
      <main className="space-y-4 px-4 pb-28">
        <section
          className="relative h-[270px] overflow-hidden rounded-[30px] bg-cover bg-center shadow-soft"
          style={{
            backgroundImage: `url(${activePet.isAiAvatar ? activePet.avatarImageUrl : activePet.memoryImageUrl})`,
            backgroundSize: activePet.isAiAvatar ? "cover" : "200% auto",
            backgroundPosition: activePet.isAiAvatar ? "center" : "100% 100%",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent" />
          <div className="absolute inset-y-0 left-0 flex w-[75%] flex-col justify-center p-6 text-white">
            <span className="mb-4 grid h-10 w-10 place-items-center rounded-2xl bg-white/15 backdrop-blur">
              <Clapperboard size={20} />
            </span>
            <h2 className="text-3xl font-bold">{activePet.name} {t("replay.yearSuffix")}</h2>
            <p className="mt-2 text-sm text-white/70">{t("replay.period")}</p>
            <button
              onClick={generate}
              className="mt-6 flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-ink transition active:scale-95 disabled:opacity-70"
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cocoa border-t-transparent" />
              ) : status === "done" ? (
                <Check size={15} className="text-emerald-600" />
              ) : (
                <Sparkles size={15} className="text-cocoa" />
              )}
              {buttonText}
            </button>
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-4 shadow-soft">
          <h2 className="mb-3 font-bold">{t("replay.highlights")}</h2>
          <div className="grid grid-cols-2 gap-2">
            {imagePositions.map((position, index) => (
              <div
                key={position}
                className={`relative h-32 overflow-hidden rounded-[18px] bg-stone-200 bg-no-repeat transition duration-700 ${
                  status === "done" ? "scale-100 opacity-100" : "scale-[.98] opacity-80"
                }`}
                style={{
                  backgroundImage: `url(${activePet.memoryImageUrl})`,
                  backgroundPosition: position,
                  backgroundSize: "200% auto",
                  transitionDelay: `${index * 80}ms`,
                }}
              >
                <div className="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-black/35 text-white backdrop-blur">
                  <Sparkles size={12} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-xs font-bold text-cocoa">
            <Sparkles size={15} /> {t("replay.summaryTitle")}
          </div>
          <p className="mt-3 text-sm leading-6 text-stone-600">{t("replay.summary")}</p>
          <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-mist py-3 text-xs font-bold text-stone-600">
            <Share2 size={15} /> {t("replay.share")}
          </button>
        </section>
      </main>
    </>
  );
}
