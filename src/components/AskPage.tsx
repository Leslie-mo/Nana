"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { ImagePlus, MessageCircleHeart, Send, UploadCloud } from "lucide-react";
import type { ChatMessage, Locale, PetAvatar, SocialPost, SocialPostDraft } from "@/types";
import { chatWithPetMemory, generateSocialPostFromImage, updatePetMemoryFromPost } from "@/lib/gemini";
import { AnimatedAvatar } from "./AnimatedAvatar";
import { AppHeader } from "./AppHeader";
import { useAppContext } from "./AppContext";

export function AskPage({
  locale,
  onLocaleChange,
  avatar,
  onPublishPost,
  t,
}: {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  avatar: PetAvatar | null;
  onPublishPost: (post: SocialPost) => void;
  t: (key: string) => string;
}) {
  const { activePet } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState<Record<number, boolean>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: "user", text: t("ask.user1") },
    { id: 2, role: "nana", text: t("ask.nana1") },
    { id: 3, role: "user", text: t("ask.user2") },
    { id: 4, role: "nana", text: t("ask.nana2") },
  ]);

  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedImage(URL.createObjectURL(file));
    event.target.value = "";
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if ((!message && !selectedImage) || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      text: message || t("ask.imageOnly"),
      imageUrl: selectedImage ?? undefined,
    };
    const next = [...messages, userMessage];
    setMessages(next);
    setInput("");
    setSelectedImage(null);
    setLoading(true);

    if (selectedImage) {
      const draft = await generateSocialPostFromImage(selectedImage, message, activePet.name);
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "nana",
          text: t("ask.socialDraftReady"),
          socialDraft: draft,
        },
      ]);
    } else {
      const response = await chatWithPetMemory(message, next, activePet.socialImageUrl, activePet.identityPrompt);
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "nana",
          text: t(response.replyKey),
          imageUrl: response.imageUrl,
          imagePosition: response.imagePosition,
        },
      ]);
    }
    setLoading(false);
  }

  async function publishDraft(messageId: number, draft: SocialPostDraft) {
    const post: SocialPost = {
      id: `post-${Date.now()}`,
      petId: activePet.id,
      petName: activePet.name,
      avatarUrl: activePet.avatarImageUrl,
      imageUrl: draft.imageUrl,
      title: draft.title,
      caption: draft.caption,
      hashtags: draft.hashtags,
      likes: 0,
      comments: 0,
      timeKey: "social.timeNow",
      aiGenerated: true,
    };
    setPublished((current) => ({ ...current, [messageId]: true }));
    onPublishPost(post);
    void updatePetMemoryFromPost(post);
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader title={t("ask.title")} subtitle={t("ask.subtitle")} locale={locale} onLocaleChange={onLocaleChange} />
      <main className="flex-1 space-y-4 px-4 pb-52">
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
            {message.role === "nana" && (
              avatar ? (
                <AnimatedAvatar avatar={avatar} petName={activePet.name} size="tiny" className="mr-2 mt-1 shrink-0 border-2 border-white shadow-sm" />
              ) : (
                <div className="mr-2 mt-1 h-9 w-9 shrink-0 rounded-full border-2 border-white bg-cover bg-center shadow-sm" style={{ backgroundImage: `url(${activePet.avatarImageUrl})` }} />
              )
            )}
            <div className={`max-w-[80%] rounded-[22px] px-4 py-3 ${
              message.role === "user" ? "rounded-br-md bg-cocoa text-white" : "rounded-bl-md bg-white shadow-soft"
            }`}>
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
              {message.socialDraft && (
                <div className="mt-3 rounded-[20px] bg-cream p-3 text-ink">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cocoa">{t("ask.publishCard")}</p>
                  <h3 className="mt-2 text-base font-black">{message.socialDraft.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-stone-600">{message.socialDraft.caption}</p>
                  <p className="mt-2 text-xs font-bold text-cocoa">{message.socialDraft.hashtags.join(" ")}</p>
                  <button
                    disabled={published[message.id]}
                    onClick={() => publishDraft(message.id, message.socialDraft!)}
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
      </main>

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
          <button aria-label={t("ask.send")} className="grid h-11 w-11 place-items-center rounded-2xl bg-cocoa text-white">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
