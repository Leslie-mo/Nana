"use client";

import { useState } from "react";
import { Heart, MessageCircle, Plus, Send, Sparkles } from "lucide-react";
import { socialPets } from "@/data/mockData";
import type { Locale, SocialPost } from "@/types";
import { AppHeader } from "./AppHeader";

export function SocialPage({
  locale,
  onLocaleChange,
  posts,
  t,
}: {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  posts: SocialPost[];
  t: (key: string) => string;
}) {
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  return (
    <>
      <AppHeader title={t("social.title")} subtitle={t("social.subtitle")} locale={locale} onLocaleChange={onLocaleChange} />
      <main className="space-y-4 px-4 pb-28">
        <div className="flex items-center gap-3">
          <div className="no-scrollbar flex min-w-0 flex-1 gap-3 overflow-x-auto py-1">
            {socialPets.map((pet) => {
              return (
                <div key={pet.id} className="shrink-0 text-center">
                  <div className="rounded-full bg-gradient-to-br from-amber-300 via-rose-300 to-cocoa p-[2px]">
                    <div
                      className="h-16 w-16 rounded-full border-2 border-cream bg-no-repeat"
                      style={{
                        backgroundImage: `url(${pet.avatarUrl})`,
                        backgroundPosition: pet.imagePosition ?? "center",
                        backgroundSize: "200% auto",
                      }}
                    />
                  </div>
                  <span className="mt-1 block max-w-16 truncate text-[10px] font-bold text-stone-500">{pet.name}</span>
                </div>
              );
            })}
          </div>
          <button className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-cocoa text-white shadow-soft" aria-label={t("social.generate")}>
            <Plus size={20} />
          </button>
        </div>

        {posts.map((post) => {
          const isLiked = Boolean(liked[post.id]);
          const title = post.title ?? (post.titleKey ? t(post.titleKey) : undefined);
          const caption = post.caption ?? (post.captionKey ? t(post.captionKey) : "");
          const hashtags = post.hashtags ?? (post.hashtagsKey ? t(post.hashtagsKey).split(" ") : undefined);
          return (
            <article key={post.id} className="overflow-hidden rounded-[28px] bg-white shadow-soft">
              <div className="flex items-center gap-3 p-4">
                <div
                  className="h-10 w-10 rounded-full bg-no-repeat"
                  style={{
                    backgroundImage: `url(${post.avatarUrl})`,
                    backgroundPosition: "0% 0%",
                    backgroundSize: post.avatarUrl.includes("moments") ? "200% auto" : "cover",
                  }}
                />
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-bold">
                    {post.petName}
                    <Sparkles size={12} className="text-cocoa" />
                  </div>
                  <p className="text-[10px] text-stone-400">{post.timeLabel ?? t(post.timeKey)}</p>
                </div>
                <span className="ml-auto rounded-full bg-sand/40 px-2.5 py-1 text-[9px] font-bold text-cocoa">
                  {t("social.aiGenerated")}
                </span>
              </div>
              <div
                className="aspect-square w-full bg-stone-100 bg-no-repeat"
                style={{
                  backgroundImage: `url(${post.imageUrl})`,
                  backgroundPosition: post.imagePosition ?? "center",
                  backgroundSize: post.imagePosition ? "200% auto" : "cover",
                }}
              />
              <div className="p-4">
                <div className="flex items-center gap-5">
                  <button
                    onClick={() => setLiked((current) => ({ ...current, [post.id]: !current[post.id] }))}
                    className={isLiked ? "text-rose-500" : "text-stone-600"}
                    aria-label={t("social.like")}
                  >
                    <Heart size={22} fill={isLiked ? "currentColor" : "none"} />
                  </button>
                  <button className="text-stone-600" aria-label={t("social.comment")}><MessageCircle size={21} /></button>
                  <button className="text-stone-600" aria-label={t("social.share")}><Send size={20} /></button>
                </div>
                <p className="mt-3 text-xs font-bold">{post.likes + (isLiked ? 1 : 0)} {t("social.likes")}</p>
                {title && <h2 className="mt-2 text-base font-black">{title}</h2>}
                <p className="mt-2 text-sm leading-6">
                  <strong className="mr-2">{post.petName}</strong>
                  {caption}
                </p>
                {hashtags && (
                  <p className="mt-2 text-xs font-bold text-cocoa">{hashtags.join(" ")}</p>
                )}
                {post.commentList && (
                  <div className="mt-3 space-y-2">
                    {post.commentList.slice(0, 2).map((comment) => (
                      <p key={comment.id} className="text-xs leading-5 text-stone-600">
                        <strong className="mr-1 text-ink">{comment.petName}</strong>
                        {comment.text ?? (comment.textKey ? t(comment.textKey) : "")}
                      </p>
                    ))}
                  </div>
                )}
                <button className="mt-2 text-xs text-stone-400">
                  {t("social.viewComments").replace("{count}", String(post.comments))}
                </button>
              </div>
            </article>
          );
        })}
      </main>
    </>
  );
}
