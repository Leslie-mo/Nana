import { Brain, RefreshCw } from "lucide-react";
import { traits } from "@/data/mockData";
import type { Locale, PetAvatar } from "@/types";
import { AnimatedAvatar } from "./AnimatedAvatar";
import { AppHeader } from "./AppHeader";
import { RadarChart } from "./RadarChart";
import { useAppContext } from "./AppContext";

export function PersonalityPage({
  locale,
  onLocaleChange,
  avatar,
  t,
}: {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  avatar: PetAvatar | null;
  t: (key: string) => string;
}) {
  const { activePet } = useAppContext();
  return (
    <>
      <AppHeader title={t("personality.title")} subtitle={t("personality.subtitle")} locale={locale} onLocaleChange={onLocaleChange} />
      <main className="space-y-4 px-4 pb-28">
        <section className="rounded-[28px] bg-white px-4 py-5 shadow-soft"><RadarChart t={t} /></section>
        <section className="rounded-[28px] bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-xl bg-sand/50 p-2 text-cocoa"><Brain size={18} /></span>
            <h2 className="font-bold">{t("personality.title")}</h2>
          </div>
          <div className="space-y-4">
            {traits.map((trait) => (
              <div key={trait.key} className="grid grid-cols-[78px_1fr_30px] items-center gap-2">
                <span className="text-xs font-semibold">{t(`trait.${trait.key}`)}</span>
                <div className="h-2 overflow-hidden rounded-full bg-mist">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#D4A77D] to-cocoa" style={{ width: `${trait.value}%` }} />
                </div>
                <span className="text-right text-xs font-bold">{trait.value}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="relative min-h-[230px] overflow-hidden rounded-[28px] bg-[#352D28] p-6 text-white shadow-soft">
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-cocoa/25 blur-2xl" />
          {avatar && (
            <AnimatedAvatar avatar={avatar} petName={activePet.name} size="medium" className="absolute -bottom-2 -right-2 border-4 border-[#57483E] shadow-soft" />
          )}
          <p className="text-xs font-bold uppercase tracking-widest text-sand">{t("personality.typeLabel")}</p>
          <div className="mt-3 flex items-baseline gap-3">
            <h2 className="text-3xl font-bold">{t("personality.type")}</h2>
            <span className="text-sm font-bold text-[#D9AB82]">{t("personality.code")}</span>
          </div>
          <p className={`mt-4 text-sm leading-6 text-white/70 ${avatar ? "max-w-[68%]" : "max-w-[90%]"}`}>
            {t("personality.description")}
          </p>
          <div className="mt-5 flex items-center gap-2 text-[10px] text-white/45">
            <RefreshCw size={12} /> {t("personality.updated")}
          </div>
        </section>
      </main>
    </>
  );
}
