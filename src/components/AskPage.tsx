"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, MessageCircleHeart, Send, UploadCloud } from "lucide-react";
import { habitInsights, healthSignals, lifeMilestones, memories, traits } from "@/data/mockData";
import { reactionAssets } from "@/data/reactionAssets";
import { chatWithNana } from "@/lib/gemini";
import type { ChatMessage, Locale, NanaChatContext, NanaSuggestedPost, PetAvatar, SocialPost } from "@/types";
import { AnimatedAvatar } from "./AnimatedAvatar";
import { AnimatedPetAvatar } from "./AnimatedPetAvatar";
import { AppHeader } from "./AppHeader";
import { useAppContext } from "./AppContext";

export function AskPage({
  locale,
  onLocaleChange,
  avatar,
  socialPosts,
  onPublishPost,
  t,
}: {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  avatar: PetAvatar | null;
  socialPosts: SocialPost[];
  onPublishPost: (post: SocialPost) => void;
  t: (key: string) => string;
}) {
  const { activePet } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendLocked, setSendLocked] = useState(false);
  const [published, setPublished] = useState<Record<number, boolean>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: "user", text: t("ask.user1") },
    { id: 2, role: "nana", text: t("ask.nana1"), action: "jump", mood: "happy" },
    { id: 3, role: "user", text: t("ask.user2") },
    { id: 4, role: "nana", text: t("ask.nana2"), action: "cute", mood: "hungry" },
  ]);

  const translatedContext = useMemo<NanaChatContext>(() => {
    const translatePost = (post: SocialPost) => ({
      id: post.id,
      petName: post.petName,
      title: post.title ?? (post.titleKey ? t(post.titleKey) : ""),
      caption: post.caption ?? (post.captionKey ? t(post.captionKey) : ""),
      hashtags: post.hashtags ?? (post.hashtagsKey ? t(post.hashtagsKey).split(" ") : []),
      time: post.timeLabel ?? t(post.timeKey),
    });

    return {
      petProfile: {
        id: activePet.id,
        name: activePet.name,
        age: activePet.age,
        breed: t(activePet.breedKey),
        mood: activePet.mood,
        identityPrompt: activePet.identityPrompt,
        avatarSpec: avatar?.avatarSpec,
      },
      personalityTraits: traits.map((trait) => ({ key: trait.key, value: trait.value })),
      todayStatus: {
        mood: `${activePet.mood}%`,
        activity: "+18%",
        healthSignal: t("home.water"),
      },
      lifeArchive: {
        milestones: lifeMilestones.map((item) => ({ date: item.date, title: t(item.titleKey), growthDelta: item.growthDelta })),
        habits: habitInsights.map((item) => ({ text: t(item.textKey), growthDelta: item.growthDelta })),
        healthSignals: healthSignals.map((item) => ({ text: t(item.textKey), advice: t(item.adviceKey) })),
      },
      memories: memories.map((memory) => ({
        date: memory.date,
        title: t(memory.titleKey),
        description: t(memory.descriptionKey),
      })),
      socialPosts: socialPosts.filter((post) => post.petId === activePet.id).slice(0, 8).map(translatePost),
      recentChatMessages: messages.slice(-8).map(({ role, text }) => ({ role, text })),
    };
  }, [activePet, avatar?.avatarSpec, messages, socialPosts, t]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (selectedImage) URL.revokeObjectURL(selectedImage);
    setSelectedImage(URL.createObjectURL(file));
    setSelectedImageFile(file);
    event.target.value = "";
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if ((!message && !selectedImageFile) || loading || sendLocked) return;
    setSendLocked(true);
    window.setTimeout(() => setSendLocked(false), 2000);

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      text: message || t("ask.imageOnly"),
      imageUrl: selectedImage ?? undefined,
    };
    const next = [...messages, userMessage];
    const imageFile = selectedImageFile;
    setMessages(next);
    setInput("");
    setSelectedImage(null);
    setSelectedImageFile(null);
    setLoading(true);

    try {
      const response = await chatWithNana({
        message: message || t("ask.imageOnly"),
        history: next,
        identityPrompt: activePet.identityPrompt,
        locale,
        context: translatedContext,
        imageFile,
        fallbackAvatar: avatar?.avatarImageUrl ?? activePet.avatarImageUrl,
      });
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "nana",
          text: response.text,
          evidenceItems: response.evidence,
          mood: response.mood,
          action: response.action,
          media: response.media,
          mediaKey: response.mediaKey,
          fallbackReason: response.fallbackReason,
          suggestedPost: response.suggestedPost,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "nana",
          text: t("ask.fixedReply"),
          evidenceItems: ["local fallback", "Nana memory"],
          fallbackReason: "quota",
          action: "blink",
          mood: "curious",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function publishSuggestedPost(message: ChatMessage, suggestedPost: NanaSuggestedPost) {
    const post: SocialPost = {
      id: `post-${Date.now()}`,
      petId: activePet.id,
      petName: activePet.name,
      avatarUrl: activePet.avatarImageUrl,
      imageUrl: message.media?.url ?? (activePet.socialImageUrl || activePet.avatarImageUrl),
      title: suggestedPost.title,
      caption: suggestedPost.body,
      hashtags: suggestedPost.hashtags,
      likes: 0,
      comments: 0,
      timeKey: "social.timeNow",
      aiGenerated: true,
    };
    setPublished((current) => ({ ...current, [message.id]: true }));
    onPublishPost(post);
  }

  function renderNanaAvatar(message?: ChatMessage) {
    const action = message?.action ?? "idle";
    if (message?.action || avatar?.frames?.length) {
      return (
        <AnimatedPetAvatar
          frames={avatar?.frames ?? activePet.animationFrameUrls}
          fallbackAvatar={avatar?.avatarImageUrl ?? activePet.avatarImageUrl}
          petName={activePet.name}
          action={action}
          size="tiny"
          className="mr-2 mt-1 shrink-0 border-2 border-white shadow-sm"
        />
      );
    }
    return avatar ? (
      <AnimatedAvatar avatar={avatar} petName={activePet.name} size="tiny" className="mr-2 mt-1 shrink-0 border-2 border-white shadow-sm" />
    ) : (
      <div className="mr-2 mt-1 h-9 w-9 shrink-0 rounded-full border-2 border-white bg-cover bg-center shadow-sm" style={{ backgroundImage: `url(${activePet.avatarImageUrl})` }} />
    );
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-cream">
      <AppHeader title={t("ask.title")} subtitle={t("ask.subtitle")} locale={locale} onLocaleChange={onLocaleChange} />

      <div ref={scrollRef} className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-[206px]">
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3 rounded-[22px] bg-white p-3 shadow-soft">
            {avatar ? (
              <AnimatedAvatar avatar={avatar} petName={activePet.name} size="small" />
            ) : (
              <div className="h-14 w-14 rounded-[20px] bg-cover bg-center" style={{ backgroundImage: `url(${activePet.avatarImageUrl})` }} />
            )}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold">
                {activePet.name} <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              </div>
              <p className="mt-1 text-[10px] text-stone-400">{t("ask.avatarOnline")}</p>
            </div>
            <MessageCircleHeart size={17} className="ml-auto text-cocoa" />
          </div>

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "nana" && renderNanaAvatar(message)}
              <div
                className={`max-w-[82%] rounded-[22px] px-4 py-3 ${
                  message.role === "user" ? "rounded-br-md bg-cocoa text-white" : "rounded-bl-md bg-white shadow-soft"
                }`}
              >
                {message.imageUrl && (
                  <div
                    className="mb-3 aspect-square w-full min-w-[210px] rounded-[18px] bg-stone-100 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${message.imageUrl})`,
                      backgroundPosition: message.imagePosition ?? "center",
                      backgroundSize: message.imagePosition ? "200% auto" : "cover",
                    }}
                  />
                )}
                <p className="text-sm leading-6">{message.text}</p>
                {message.media?.type === "image" && message.media.url && (
                  <div className="mt-3 overflow-hidden rounded-[18px] bg-cream">
                    <img
                      src={message.media.url}
                      alt={message.media.caption ?? activePet.name}
                      onError={(event) => {
                        event.currentTarget.src = reactionAssets.profiles[0];
                      }}
                      className="mt-2 aspect-square w-full object-cover"
                    />
                    {message.media.caption && <p className="p-3 text-xs leading-5 text-stone-600">{message.media.caption}</p>}
                  </div>
                )}
                {message.media?.type === "animation" && (
                  <div className="mt-3 rounded-[20px] bg-cream p-3">
                    <div className="mx-auto h-44 w-full">
                      <AnimatedPetAvatar
                        frames={message.media.frames ?? activePet.animationFrameUrls}
                        fallbackAvatar={avatar?.avatarImageUrl ?? activePet.avatarImageUrl}
                        petName={activePet.name}
                        action={message.action ?? "idle"}
                      />
                    </div>
                    {message.media.caption && <p className="mt-2 text-xs leading-5 text-stone-600">{message.media.caption}</p>}
                  </div>
                )}
                {message.suggestedPost && (
                  <div className="mt-3 rounded-[20px] bg-cream p-3 text-ink">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cocoa">{t("ask.publishCard")}</p>
                    <h3 className="mt-2 text-base font-black">{message.suggestedPost.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-stone-600">{message.suggestedPost.body}</p>
                    <p className="mt-2 text-xs font-bold text-cocoa">{message.suggestedPost.hashtags.join(" ")}</p>
                    <button
                      disabled={published[message.id]}
                      onClick={() => publishSuggestedPost(message, message.suggestedPost!)}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-cocoa py-3 text-xs font-bold text-white disabled:bg-stone-300"
                    >
                      <UploadCloud size={15} />
                      {published[message.id] ? t("ask.published") : t("ask.publish")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cocoa" /> {t("ask.thinking")}
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-[76px] z-20 bg-gradient-to-t from-cream via-cream to-transparent px-4 pb-3 pt-8">
        {selectedImage && (
          <div className="mb-2 flex items-center gap-2 rounded-[18px] bg-white p-2 shadow-soft">
            <div className="h-14 w-14 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${selectedImage})` }} />
            <p className="min-w-0 flex-1 text-xs font-bold text-stone-500">{t("ask.imageReady")}</p>
            <button onClick={() => setSelectedImage(null)} className="rounded-full bg-cream px-3 py-1 text-[10px] font-bold text-cocoa">{t("ask.removeImage")}</button>
          </div>
        )}
        <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto">
          {["ask.suggestion1", "ask.suggestion2", "ask.suggestion3"].map((key) => (
            <button key={key} onClick={() => setInput(t(key))} className="shrink-0 rounded-full border border-sand bg-white px-3 py-2 text-xs text-stone-500">
              {t(key)}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="flex items-center gap-2 rounded-[22px] bg-white p-2 shadow-soft">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={chooseImage} />
          <button type="button" onClick={() => fileInputRef.current?.click()} aria-label={t("ask.addImage")} className="grid h-11 w-11 place-items-center rounded-2xl bg-cream text-cocoa">
            <ImagePlus size={18} />
          </button>
          <input value={input} onChange={(event) => setInput(event.target.value)} placeholder={t("ask.placeholder")} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-stone-300" />
          <button
            aria-label={t("ask.send")}
            disabled={loading || sendLocked}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-cocoa text-white disabled:bg-stone-300"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
