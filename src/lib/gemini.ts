import { NANA_IDENTITY_PROMPT, nanaAnimationFrames } from "@/data/mockData";
import {
  mediaKeyForAction,
  mediaKeyForMood,
  reactionAssets,
  reactionMediaForKey,
} from "@/data/reactionAssets";
import type {
  AnimatedAvatar,
  AnimatedPetAvatarResult,
  ChatMessage,
  Locale,
  NanaAction,
  NanaChatContext,
  NanaReply,
  PetAvatar,
  PetAvatarSpec,
  SocialPost,
  SocialPostDraft,
} from "@/types";

const pause = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

export async function analyzePetImage(_imageUrl: string) {
  await pause();
  return { activity: "watching", confidence: 0.92 };
}

export async function summarizePetDay(_events: unknown[]) {
  await pause();
  return { summaryKey: "home.summary" };
}

export async function generatePetPersonality(_history: unknown[]) {
  await pause();
  return { type: "ISTJ-A", confidence: 0.86 };
}

export function framesForAction(action: NanaAction = "idle") {
  if (action === "wave") return [...reactionAssets.animations.wave];
  if (action === "jump" || action === "cute") return [...reactionAssets.animations.jump];
  if (action === "sleep") return [...reactionAssets.animations.sleep];
  return [...reactionAssets.animations.idle];
}

function isQuotaErrorText(text: string) {
  return /(quota|rate limit|429|resource exhausted)/i.test(text);
}

function localNanaFallbackReply(message: string, reason: "quota" | "demo" = "quota", locale: Locale = "zh"): NanaReply {
  const text = {
    sleepy: {
      zh: "有点困了喵……我想先趴一会儿。",
      en: "I am a little sleepy, meow... I want to curl up for a bit.",
      ja: "ちょっと眠いにゃ……先に少し丸くなって休みたいの。",
    },
    playful: {
      zh: "当然想玩！不过我先伸个懒腰～",
      en: "Of course I want to play! Let me stretch first.",
      ja: "もちろん遊びたいよ！でも先にのびーってするね。",
    },
    hungry: {
      zh: "冻干的话，我可以考虑一下。要小块一点喵。",
      en: "If it is freeze-dried treats, I might consider it. Make the pieces small, meow.",
      ja: "フリーズドライなら考えてもいいよ。小さめにしてね、にゃ。",
    },
    love: {
      zh: "哼，我才没有很开心……只是尾巴有点不听话。",
      en: "Hmph, I am not that happy... my tail just will not listen.",
      ja: "ふん、そんなに嬉しくないよ……しっぽが少し勝手に動いただけ。",
    },
    default: {
      zh: "我听到了喵。现在我先用自己的记忆回答你。",
      en: "I heard you, meow. I will answer from my own Nana memories for now.",
      ja: "聞こえたにゃ。今はNanaの記憶から答えるね。",
    },
  } as const;

  if (/(困|睡|晚安|sleep|眠|おやすみ)/i.test(message)) {
    return {
      text: text.sleepy[locale],
      evidence: ["local fallback", "Nana memory"],
      mood: "sleepy",
      action: "sleep",
      mediaKey: "anim_sleep",
      fallbackReason: reason,
    };
  }

  if (/(玩|跳|开心|play|jump|happy|楽しい|遊)/i.test(message)) {
    return {
      text: text.playful[locale],
      evidence: ["local fallback", "Nana memory"],
      mood: "playful",
      action: "jump",
      mediaKey: "anim_jump",
      fallbackReason: reason,
    };
  }

  if (/(吃|冻干|饿|food|eat|hungry|ごはん|食)/i.test(message)) {
    return {
      text: text.hungry[locale],
      evidence: ["local fallback", "Nana memory"],
      mood: "hungry",
      action: "cute",
      mediaKey: "post_breakfast",
      fallbackReason: reason,
    };
  }

  if (/(喜欢|爱|love|like|好き|大好き)/i.test(message)) {
    return {
      text: text.love[locale],
      evidence: ["local fallback", "Nana memory"],
      mood: "shy",
      action: "cute",
      mediaKey: "emotion_love",
      fallbackReason: reason,
    };
  }

  return {
    text: text.default[locale],
    evidence: ["local fallback", "Nana memory"],
    mood: "curious",
    action: "idle",
    mediaKey: "emotion_curious",
    fallbackReason: reason,
  };
}

async function imageFileToGeminiPart(imageFile: File) {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(imageFile);
  });
  const [, data = ""] = dataUrl.split(",");
  return {
    mimeType: imageFile.type || "image/jpeg",
    data,
    fileName: imageFile.name,
  };
}

function inferAction(message: string, action?: NanaAction): NanaAction {
  if (action && action !== "idle") return action;
  if (/(打招呼|招呼|hello|hi|wave|こんにちは|挨拶)/i.test(message)) return "wave";
  if (/(开心|高兴|happy|うれしい|ごきげん)/i.test(message)) return "jump";
  if (/(困|睡|sleep|眠|寝)/i.test(message)) return "sleep";
  if (/(玩|跳|dance|ダンス|遊|jump)/i.test(message)) return "jump";
  if (/(看|观察|look|around|見る)/i.test(message)) return "lookAround";
  return action ?? "idle";
}

function normalizeClientReply(reply: NanaReply, fallbackAvatar: string, message: string): NanaReply {
  const action = inferAction(message, reply.action);
  const mediaKey = reply.mediaKey ?? (reply.mood ? mediaKeyForMood(reply.mood) : mediaKeyForAction(action));
  const asksForImage = /(照片|图片|图|自拍|写真|photo|picture|image)/i.test(message);
  const asksForAnimation = /(动画|动一动|跳舞|舞|样子|看看|看一下|展示|show|dance|animation|見せて|みせて)/i.test(message);
  const asksForPost = /(朋友圈|宠物圈|发帖|投稿|post|social)/i.test(message);
  const localMedia = reactionMediaForKey(mediaKey);
  const wantsAnimation =
    asksForAnimation && (reply.media?.type === "animation" || localMedia.type === "animation" || ["wave", "jump", "blink", "sleep", "cute", "lookAround"].includes(action));
  const media =
    asksForImage && localMedia.type === "image"
      ? { type: "image" as const, url: localMedia.url || fallbackAvatar, caption: reply.media?.caption }
      : asksForImage
        ? { type: "image" as const, url: reactionAssets.profiles[0] || fallbackAvatar, caption: reply.media?.caption }
      : wantsAnimation
        ? {
            type: "animation" as const,
            frames: localMedia.frames?.length ? [...localMedia.frames] : framesForAction(action),
            caption: reply.media?.caption,
          }
        : undefined;

  return {
    ...reply,
    action,
    mediaKey,
    fallbackReason: reply.fallbackReason,
    evidence: reply.evidence ?? [],
    media,
    suggestedPost:
      reply.suggestedPost ??
      (asksForPost
        ? {
            title: "Nana update",
            body: reply.text,
            hashtags: ["#Nana", "#DigitalTwin", "#PetCircle"],
          }
        : undefined),
  };
}

export async function chatWithNana({
  message,
  history,
  identityPrompt = NANA_IDENTITY_PROMPT,
  locale = "zh",
  context,
  imageFile,
  fallbackAvatar = "/images/nana-ai-avatar.png",
}: {
  message: string;
  history: ChatMessage[];
  identityPrompt?: string;
  locale?: Locale;
  context: NanaChatContext;
  imageFile?: File | null;
  fallbackAvatar?: string;
}): Promise<NanaReply> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return normalizeClientReply(localNanaFallbackReply(message, "demo", locale), fallbackAvatar, message);
  }

  let response: Response;
  try {
    response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history: history.slice(0, -1).slice(-8).map(({ role, text }) => ({ role, text })),
        identityPrompt,
        locale,
        context,
        image: imageFile ? await imageFileToGeminiPart(imageFile) : undefined,
      }),
    });
  } catch (error) {
    const errorText = error instanceof Error ? error.message : String(error);
    if (isQuotaErrorText(errorText)) {
      return normalizeClientReply(localNanaFallbackReply(message, "quota", locale), fallbackAvatar, message);
    }
    throw error;
  }

  const data = (await response.json()) as NanaReply & { error?: string };
  if (!response.ok || !data.text) {
    const errorText = data.error || `Gemini API request failed with status ${response.status}`;
    if (response.status === 429 || isQuotaErrorText(errorText)) {
      return normalizeClientReply(localNanaFallbackReply(message, "quota", locale), fallbackAvatar, message);
    }
    throw new Error(errorText || "Nana could not reply.");
  }

  return normalizeClientReply(data, fallbackAvatar, message);
}

export async function chatWithPetMemory(
  message: string,
  history: ChatMessage[],
  socialImageUrl = "/images/nana-social.png",
  identityPrompt = NANA_IDENTITY_PROMPT,
  locale: Locale = "zh",
) {
  const reply = await chatWithNana({
    message,
    history,
    identityPrompt,
    locale,
    fallbackAvatar: socialImageUrl,
    context: {
      petProfile: { identityPrompt, socialImageUrl },
      personalityTraits: [],
      todayStatus: {},
      lifeArchive: [],
      memories: [],
      socialPosts: [],
      recentChatMessages: history.slice(0, -1).slice(-8).map(({ role, text }) => ({ role, text })),
    },
  });

  return { reply: reply.text, action: reply.action, mood: reply.mood, media: reply.media, suggestedPost: reply.suggestedPost, evidence: reply.evidence };
}

export async function generateLifeReplay(_year: string) {
  await pause(1000);
  return { status: "generated", summaryKey: "replay.summary" };
}

function fallbackAvatarSpec(locale: Locale = "zh"): PetAvatarSpec {
  const personality = {
    zh: "好奇、冷静、爱观察",
    en: "Curious, calm, observant",
    ja: "好奇心旺盛で落ち着いた観察家",
  }[locale];

  return {
    species: "cat",
    breedGuess: "Japanese domestic shorthair",
    bodyShape: "adult cat with soft rounded proportions",
    faceShape: "round face with gentle expression",
    eyeColor: "green-yellow",
    furColors: ["white", "brown tabby"],
    furPattern: "white chest with brown tabby patches",
    tailShape: "short kinked Japanese bobtail",
    specialMarks: ["white chest", "tabby patches", "soft round cheeks"],
    personalityImpression: personality,
    avatarPrompt:
      "semi-realistic full body digital mascot of Nana, adult Japanese domestic cat, white chest, brown tabby patches, green-yellow eyes, short kinked tail, transparent background, clean cutout, high quality",
    animationPrompt:
      "create 8 sequential frames of the same cat mascot doing idle breathing, blinking, waving, jumping, transparent background",
  };
}

function extractJsonObject(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const source = fenced || text;
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return source;
  return source.slice(start, end + 1);
}

function normalizeAvatarSpec(value: Partial<PetAvatarSpec>, locale: Locale): PetAvatarSpec {
  const fallback = fallbackAvatarSpec(locale);
  return {
    species: value.species || fallback.species,
    breedGuess: value.breedGuess || fallback.breedGuess,
    bodyShape: value.bodyShape || fallback.bodyShape,
    faceShape: value.faceShape || fallback.faceShape,
    eyeColor: value.eyeColor || fallback.eyeColor,
    furColors: Array.isArray(value.furColors) && value.furColors.length ? value.furColors : fallback.furColors,
    furPattern: value.furPattern || fallback.furPattern,
    tailShape: value.tailShape || fallback.tailShape,
    specialMarks: Array.isArray(value.specialMarks) && value.specialMarks.length ? value.specialMarks : fallback.specialMarks,
    personalityImpression: value.personalityImpression || fallback.personalityImpression,
    avatarPrompt: value.avatarPrompt || fallback.avatarPrompt,
    animationPrompt: value.animationPrompt || fallback.animationPrompt,
  };
}

async function fileToGenerativePart(imageFile: File) {
  const buffer = Buffer.from(await imageFile.arrayBuffer());
  return {
    inlineData: {
      mimeType: imageFile.type || "image/jpeg",
      data: buffer.toString("base64"),
    },
  };
}

export async function generatePetAvatarFromImage(imageFile: File, locale: Locale = "zh"): Promise<PetAvatarSpec> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");

  const model = process.env.GEMINI_VISION_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const imagePart = await fileToGenerativePart(imageFile);
  const prompt = `You are a pet digital twin designer.

Analyze this pet photo and create a stable character design spec for an AI digital pet avatar.

Focus on:
- species
- breed guess
- body shape
- face shape
- eye color
- fur colors
- fur pattern
- tail shape
- special marks
- personality impression
- animation-friendly design notes

Rules:
- Do not make the pet look like a baby unless it is actually a baby.
- Keep the pet's real identity and markings.
- Make it suitable for a semi-realistic digital mascot.
- The avatar should be cute but not childish.
- Return JSON only.`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }, imagePart] }],
      generationConfig: { temperature: 0.25, topP: 0.8, maxOutputTokens: 900, responseMimeType: "application/json" },
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Gemini Vision request failed.");

  const text =
    data.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text)
      .filter(Boolean)
      .join("\n") || "";

  return normalizeAvatarSpec(JSON.parse(extractJsonObject(text)) as Partial<PetAvatarSpec>, locale);
}

export async function generateAnimatedPetAvatar(imageFile: File, locale: Locale = "zh"): Promise<AnimatedPetAvatarResult> {
  try {
    return {
      avatarSpec: await generatePetAvatarFromImage(imageFile, locale),
      frames: nanaAnimationFrames,
      animationType: "idle",
      source: "gemini-spec-fallback-frames",
    };
  } catch {
    return {
      avatarSpec: fallbackAvatarSpec(locale),
      frames: [],
      animationType: "idle",
      source: "css-fallback",
    };
  }
}

export async function generateSocialPostFromImage(
  imageUrl: string,
  text: string,
  petName = "Nana",
): Promise<SocialPostDraft> {
  await pause(700);
  return {
    title: `${petName} photo diary`,
    caption: text.trim() || "I inspected this moment very carefully and decided it belongs in my pet circle.",
    hashtags: ["#NanaDaily", "#DigitalTwin", "#PetCircle"],
    imageUrl,
  };
}

export async function analyzePetBehaviorFromImage(_imageUrl: string) {
  await pause();
  return { behavior: "window-watching", mood: "curious", confidence: 0.9 };
}

export async function updatePetMemoryFromPost(_post: SocialPost) {
  await pause();
  return { updated: true, memoryEventId: `memory-${Date.now()}` };
}

export async function generateLifeArchive(_petId: string) {
  await pause();
  return { archiveVersion: "mock-2026-06", generatedAt: new Date().toISOString() };
}

export async function generatePetAvatar(
  imageFile: File,
  identityPrompt = NANA_IDENTITY_PROMPT,
  locale: Locale = "zh",
): Promise<PetAvatar> {
  const sourceImageUrl = URL.createObjectURL(imageFile);
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("locale", locale);

  const response = await fetch("/api/generate-avatar", { method: "POST", body: formData });
  const result = (await response.json()) as AnimatedPetAvatarResult & { error?: string };
  if (!response.ok) throw new Error(result.error || "Failed to generate pet avatar.");

  return {
    id: `nana-avatar-${Date.now()}`,
    sourceImageUrl,
    avatarImageUrl: "/images/shot/nana_cat_01.png",
    style: "gemini-vision-local-reaction-character",
    personalitySeed: `${result.avatarSpec.personalityImpression} | ${identityPrompt}`,
    createdAt: new Date().toISOString(),
    avatarSpec: result.avatarSpec,
    frames: result.frames,
    animationType: result.animationType,
    animationSource: result.source,
  };
}

export async function animatePetAvatar(avatar: PetAvatar): Promise<AnimatedAvatar> {
  await pause(450);
  return {
    avatarId: avatar.id,
    animationType: "idle-float-blink-breathe",
    previewUrl: avatar.avatarImageUrl,
  };
}
