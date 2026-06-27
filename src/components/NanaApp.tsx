"use client";

import { useMemo, useState } from "react";
import type { Locale, PetAvatar, PetProfile, SocialPost, TabId } from "@/types";
import { NANA_IDENTITY_PROMPT, pets as initialPets, socialPosts as initialSocialPosts } from "@/data/mockData";
import { translate } from "@/i18n/messages";
import { AppContextProvider } from "./AppContext";
import { AskPage } from "./AskPage";
import { AvatarCreate } from "./AvatarCreate";
import { BottomNav } from "./BottomNav";
import { HomePage } from "./HomePage";
import { MemoryPage } from "./MemoryPage";
import { PersonalityPage } from "./PersonalityPage";
import { PetSwitcher } from "./PetSwitcher";
import { SettingsPanel } from "./SettingsPanel";
import { SocialPage } from "./SocialPage";

const nanaAvatar: PetAvatar = {
  id: "nana-avatar-preset",
  sourceImageUrl: "/images/nana-ai-avatar.png",
  avatarImageUrl: "/images/nana-ai-avatar.png",
  style: "tabby-white-3d-digital-character",
  personalitySeed: `curious-calm-charming-slightly-sassy | ${NANA_IDENTITY_PROMPT}`,
  createdAt: "2026-06-14T00:00:00.000Z",
};

export function NanaApp() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [locale, setLocale] = useState<Locale>("ja");
  const [profiles, setProfiles] = useState<PetProfile[]>(initialPets);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(initialSocialPosts);
  const [activePetId, setActivePetId] = useState("nana");
  const [avatars, setAvatars] = useState<Record<string, PetAvatar | null>>({
    nana: nanaAvatar,
    momo: null,
  });
  const [avatarCreatorOpen, setAvatarCreatorOpen] = useState(false);
  const [avatarStartMode, setAvatarStartMode] = useState<"upload" | "camera">("upload");
  const [petSwitcherOpen, setPetSwitcherOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const activePet = profiles.find((profile) => profile.id === activePetId) ?? profiles[0];
  const avatar = avatars[activePet.id] ?? null;
  const t = useMemo(
    () => (key: string) => translate(locale, key).replaceAll("Nana", activePet.name),
    [activePet.name, locale],
  );

  const commonProps = { locale, onLocaleChange: setLocale, t };
  const pages: Record<TabId, React.ReactNode> = {
    home: (
      <HomePage
        key={`home-${locale}-${activePet.id}`}
        {...commonProps}
        avatar={avatar}
        onOpenAvatar={(mode) => {
          setAvatarStartMode(mode);
          setAvatarCreatorOpen(true);
        }}
      />
    ),
    social: (
      <SocialPage
        key={`social-${locale}-${activePet.id}-${socialPosts.length}`}
        {...commonProps}
        posts={socialPosts}
      />
    ),
    ask: (
      <AskPage
        key={`ask-${locale}-${activePet.id}`}
        {...commonProps}
        avatar={avatar}
        onPublishPost={(post) => {
          setSocialPosts((current) => [post, ...current]);
          setActiveTab("social");
        }}
      />
    ),
    personality: <PersonalityPage key={`personality-${locale}-${activePet.id}`} {...commonProps} avatar={avatar} />,
    memory: <MemoryPage key={`memory-${locale}-${activePet.id}`} {...commonProps} />,
  };

  function addPet(name: string) {
    const id = `pet-${Date.now()}`;
    const profile: PetProfile = {
      id,
      name,
      age: 1,
      breedKey: "breed.unknown",
      mood: 72,
      avatarImageUrl: "",
      memoryImageUrl: "",
      socialImageUrl: "",
      identityPrompt: `Preserve ${name}'s exact face, coat markings, eye color, body proportions and tail shape in every generated image.`,
      isAiAvatar: false,
    };
    setProfiles((current) => [...current, profile]);
    setAvatars((current) => ({ ...current, [id]: null }));
    setActivePetId(id);
    setPetSwitcherOpen(false);
    setActiveTab("home");
  }

  return (
    <div className="min-h-[100dvh] md:flex md:items-center md:justify-center md:gap-14 md:px-8 md:py-6">
      <aside className="hidden max-w-[310px] lg:block">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[20px] bg-cocoa text-2xl font-black text-white shadow-soft">N</div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-cocoa">Pet Digital Twin</p>
        <h1 className="mt-4 text-5xl font-black leading-[1.05] tracking-tight text-ink">
          Meet {activePet.name},<br />a digital life.
        </h1>
        <p className="mt-5 text-sm leading-6 text-stone-500">
          A pet companion that grows through memories, behavior and conversation.
        </p>
      </aside>

      <AppContextProvider
        value={{
          activePet,
          openPetSwitcher: () => setPetSwitcherOpen(true),
          openSettings: () => setSettingsOpen(true),
        }}
      >
        <div className="relative mx-auto h-[100dvh] w-full max-w-[430px] overflow-hidden bg-cream md:mx-0 md:h-[min(880px,calc(100dvh-48px))] md:min-h-[660px] md:rounded-[42px] md:border-[8px] md:border-white md:shadow-device">
          <div className="pointer-events-none absolute left-1/2 top-2 z-50 hidden h-5 w-24 -translate-x-1/2 rounded-full bg-[#2B2724] md:block" />
          <div className="no-scrollbar h-full overflow-y-auto md:pt-5">{pages[activeTab]}</div>
          <BottomNav active={activeTab} onChange={setActiveTab} t={t} />

          {avatarCreatorOpen && (
            <AvatarCreate
              initialMode={avatarStartMode}
              t={t}
              onClose={() => setAvatarCreatorOpen(false)}
              onComplete={(createdAvatar) => {
                setAvatars((current) => ({ ...current, [activePet.id]: createdAvatar }));
                setProfiles((current) =>
                  current.map((profile) =>
                    profile.id === activePet.id
                      ? {
                          ...profile,
                          avatarImageUrl: createdAvatar.avatarImageUrl,
                          memoryImageUrl: createdAvatar.avatarImageUrl,
                          socialImageUrl: createdAvatar.avatarImageUrl,
                          isAiAvatar: true,
                        }
                      : profile,
                  ),
                );
                setAvatarCreatorOpen(false);
                setActiveTab("home");
              }}
            />
          )}
          {petSwitcherOpen && (
            <PetSwitcher
              pets={profiles}
              activePetId={activePet.id}
              onClose={() => setPetSwitcherOpen(false)}
              onSelect={(id) => {
                setActivePetId(id);
                setPetSwitcherOpen(false);
              }}
              onAdd={addPet}
              t={t}
            />
          )}
          {settingsOpen && (
            <SettingsPanel
              locale={locale}
              onLocaleChange={setLocale}
              activePet={activePet}
              onClose={() => setSettingsOpen(false)}
              t={t}
            />
          )}
        </div>
      </AppContextProvider>
    </div>
  );
}
