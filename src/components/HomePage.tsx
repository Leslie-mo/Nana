"use client";

import { Activity, Camera, Droplets, Heart, Sparkles, Upload } from "lucide-react";
import type { Locale, PetAvatar } from "@/types";
import { useAppContext } from "./AppContext";
import { AnimatedAvatar } from "./AnimatedAvatar";
import { AppHeader } from "./AppHeader";
import { FloatingPetStage } from "./FloatingPetStage";

export function HomePage({
  locale,
  onLocaleChange,
  avatar,
  onOpenAvatar,
  t,
}: {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  avatar: PetAvatar | null;
  onOpenAvatar: (mode: "upload" | "camera") => void;
  t: (key: string) => string;
}) {
  const { activePet } = useAppContext();
  const hasPetImage = Boolean(activePet.avatarImageUrl);

  return (
    <>
      <AppHeader
        title={`${t("home.greeting")}, ${activePet.name}`}
        subtitle={t("home.subtitle")}
        locale={locale}
        onLocaleChange={onLocaleChange}
      />
      <main className="space-y-4 px-4 pb-28">
        <section className="relative h-[390px] overflow-hidden rounded-[34px] bg-gradient-to-b from-[#FFF8F0] via-[#F5E8D9] to-[#E8D2BC] px-4 shadow-soft">
          <div className="absolute inset-0 rounded-[34px] bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,.9),transparent_38%),radial-gradient(circle_at_20%_20%,rgba(255,205,147,.45),transparent_22rem)]" />
          <div className="relative z-10 h-full">
            {activePet.poseSpriteUrl ? (
              <FloatingPetStage pet={activePet} />
            ) : avatar ? (
              <AnimatedAvatar avatar={avatar} petName={activePet.name} />
            ) : hasPetImage ? (
              <div
                className="mx-auto h-full w-[88%] bg-contain bg-center bg-no-repeat drop-shadow-2xl"
                style={{ backgroundImage: `url(${activePet.avatarImageUrl})` }}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="grid h-20 w-20 place-items-center rounded-[28px] bg-white/70 text-cocoa shadow-soft">
                  <Sparkles size={34} />
                </div>
                <p className="mt-5 max-w-[260px] text-sm font-semibold leading-6 text-cocoa">
                  {t("home.createAvatarHint")}
                </p>
                <div className="mt-5 grid w-full grid-cols-2 gap-2">
                  <button onClick={() => onOpenAvatar("upload")} className="flex items-center justify-center gap-2 rounded-2xl bg-white py-3 text-xs font-bold text-ink shadow-sm">
                    <Upload size={15} className="text-cocoa" /> {t("home.uploadPhoto")}
                  </button>
                  <button onClick={() => onOpenAvatar("camera")} className="flex items-center justify-center gap-2 rounded-2xl bg-cocoa py-3 text-xs font-bold text-white shadow-sm">
                    <Camera size={15} /> {t("home.takePhoto")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[26px] bg-white p-5 shadow-soft">
          <div className="flex items-center gap-4">
            {hasPetImage ? (
              <div
                className="h-16 w-16 shrink-0 rounded-2xl bg-cream bg-cover bg-center shadow-sm"
                style={{ backgroundImage: `url(${activePet.avatarImageUrl})` }}
              />
            ) : (
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-cream text-cocoa shadow-sm">
                <Sparkles size={24} />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-black tracking-tight text-ink">{activePet.name}</h2>
              <p className="mt-1 text-sm font-medium text-stone-500">
                {activePet.age} {t("common.age")} · {t(activePet.breedKey)}
              </p>
              <p className="mt-1 text-xs text-cocoa">{t("home.profileHint")}</p>
            </div>
          </div>
        </section>

        {!avatar && (
          <section className="relative overflow-hidden rounded-[26px] bg-[#352D28] p-5 text-white shadow-soft">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-cocoa/40 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-xs font-bold text-sand">
                <Sparkles size={16} /> {t("home.createAvatar")}
              </div>
              <p className="mt-2 text-xs leading-5 text-white/55">{t("home.createAvatarHint")}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => onOpenAvatar("upload")} className="flex items-center justify-center gap-2 rounded-2xl bg-white py-3 text-xs font-bold text-ink">
                  <Upload size={15} className="text-cocoa" /> {t("home.uploadPhoto")}
                </button>
                <button onClick={() => onOpenAvatar("camera")} className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 py-3 text-xs font-bold text-white">
                  <Camera size={15} /> {t("home.takePhoto")}
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-[26px] bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-cocoa">{t("home.lifeDigest")}</p>
              <h3 className="mt-1 text-xl font-bold">{t("home.statusTitle")}</h3>
            </div>
            <Sparkles size={22} className="text-cocoa" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[22px] bg-cream p-4">
              <Heart size={18} className="text-rose-400" />
              <p className="mt-3 text-[10px] font-bold text-stone-400">{t("home.moodTitle")}</p>
              <p className="text-xl font-black">{activePet.mood}%</p>
            </div>
            <div className="rounded-[22px] bg-cream p-4">
              <Activity size={18} className="text-cocoa" />
              <p className="mt-3 text-[10px] font-bold text-stone-400">{t("home.activityLabel")}</p>
              <p className="text-xl font-black">+18%</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-[#352D28] p-3 text-white">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-sky-300">
              <Droplets size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/50">{t("home.aiDiscovery")}</p>
              <p className="mt-0.5 text-xs font-semibold">{t("home.water")}</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
