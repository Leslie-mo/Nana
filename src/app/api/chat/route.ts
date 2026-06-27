import { NextResponse } from "next/server";
import { reactionMediaKeys } from "@/data/reactionAssets";
import type { NanaAction, NanaMood, NanaReply } from "@/types";

type IncomingMessage = {
  role: "user" | "nana";
  text: string;
};

type ChatRequest = {
  message?: string;
  history?: IncomingMessage[];
  identityPrompt?: string;
  locale?: "zh" | "en" | "ja";
  context?: unknown;
  image?: {
    mimeType: string;
    data: string;
    fileName?: string;
  };
};

const languageNames = {
  zh: "Simplified Chinese",
  en: "English",
  ja: "Japanese",
};

const moods = new Set<NanaMood>(["happy", "curious", "sleepy", "angry", "playful", "hungry", "shy"]);
const actions = new Set<NanaAction>(["idle", "wave", "jump", "blink", "sleep", "cute", "lookAround"]);
const mediaKeys = new Set<string>(reactionMediaKeys);

function isQuotaErrorText(text: string) {
  return /(quota|rate limit|429|resource exhausted)/i.test(text);
}

function localNanaFallbackReply(message = "", reason: "quota" | "demo" = "quota", locale: ChatRequest["locale"] = "zh"): NanaReply {
  const lang = locale || "zh";
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
      text: text.sleepy[lang],
      evidence: ["local fallback", "Nana memory"],
      mood: "sleepy",
      action: "sleep",
      mediaKey: "anim_sleep",
      fallbackReason: reason,
    };
  }

  if (/(玩|跳|开心|play|jump|happy|楽しい|遊)/i.test(message)) {
    return {
      text: text.playful[lang],
      evidence: ["local fallback", "Nana memory"],
      mood: "playful",
      action: "jump",
      mediaKey: "anim_jump",
      fallbackReason: reason,
    };
  }

  if (/(吃|冻干|饿|food|eat|hungry|ごはん|食)/i.test(message)) {
    return {
      text: text.hungry[lang],
      evidence: ["local fallback", "Nana memory"],
      mood: "hungry",
      action: "cute",
      mediaKey: "post_breakfast",
      fallbackReason: reason,
    };
  }

  if (/(喜欢|爱|love|like|好き|大好き)/i.test(message)) {
    return {
      text: text.love[lang],
      evidence: ["local fallback", "Nana memory"],
      mood: "shy",
      action: "cute",
      mediaKey: "emotion_love",
      fallbackReason: reason,
    };
  }

  return {
    text: text.default[lang],
    evidence: ["local fallback", "Nana memory"],
    mood: "curious",
    action: "idle",
    mediaKey: "emotion_curious",
    fallbackReason: reason,
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

function normalizeReply(value: Partial<NanaReply>, fallbackText: string): NanaReply {
  const reply: NanaReply = {
    text: typeof value.text === "string" && value.text.trim() ? value.text.trim() : fallbackText,
    evidence: Array.isArray(value.evidence) ? value.evidence.filter((item): item is string => typeof item === "string") : [],
    action: actions.has(value.action as NanaAction) ? value.action : "idle",
  };

  if (mediaKeys.has(value.mediaKey || "")) reply.mediaKey = value.mediaKey;
  if (value.fallbackReason === "quota" || value.fallbackReason === "demo") reply.fallbackReason = value.fallbackReason;
  if (moods.has(value.mood as NanaMood)) reply.mood = value.mood;
  if (value.media?.type === "image" || value.media?.type === "animation") {
    reply.media = {
      type: value.media.type,
      url: typeof value.media.url === "string" ? value.media.url : undefined,
      frames: Array.isArray(value.media.frames)
        ? value.media.frames.filter((item): item is string => typeof item === "string")
        : undefined,
      caption: typeof value.media.caption === "string" ? value.media.caption : undefined,
    };
  }
  if (value.suggestedPost?.title && value.suggestedPost.body) {
    reply.suggestedPost = {
      title: String(value.suggestedPost.title),
      body: String(value.suggestedPost.body),
      hashtags: Array.isArray(value.suggestedPost.hashtags)
        ? value.suggestedPost.hashtags.map(String)
        : [],
    };
  }

  return reply;
}

function buildSystemPrompt(identityPrompt: string, locale: ChatRequest["locale"], context: unknown) {
  const language = languageNames[locale || "zh"];

  return [
    "You are Nana, a real cat's digital twin.",
    "You are not a generic AI assistant.",
    "You speak as Nana in first person.",
    "You remember Nana's profile, life archive, personality, social posts, and recent conversation.",
    "You can reference past memories and pet circle posts when relevant.",
    "You should decide whether to reply with text only, an action animation, an image/animation card, or a suggested social post.",
    "",
    "Rules:",
    `- Reply in selected locale: ${language}.`,
    "- Keep replies short and natural.",
    "- Do not mention you are an AI model.",
    "- Use Nana's memory when relevant.",
    "- If asked about health, do not diagnose; only suggest observation or vet if abnormal continues.",
    "- If user asks about past events, answer based on lifeArchive/memories.",
    "- If user asks about posts or social content, answer based on socialPosts.",
    "- If user asks to create a post, return suggestedPost.",
    "- If user asks Nana to move, greet, play, sleep, or show emotion, return action.",
    "- If user asks for a photo, animation, dance, play pose, or pet-circle post, include mediaKey and/or suggestedPost.",
    "- Do not claim to generate real images. The app will show local generated reaction assets based on mediaKey.",
    "",
    "mediaKey selection rules:",
    "- User says happy, likes, cute, affection, clingy: emotion_happy or emotion_love.",
    "- User says sleepy, sleep, good night: anim_sleep or post_goodnight.",
    "- User says hello, greet, wave: anim_wave.",
    "- User says jump, play, excited: anim_jump or scene_play_tunnel.",
    "- User says window, birds, observe: scene_window_birds.",
    "- User says food, breakfast, hungry: post_breakfast.",
    "- User says blanket, grooming, licking: scene_blanket_lick.",
    "- User says high place, cat tree, perch: scene_high_perch.",
    "- If unsure: emotion_curious or anim_idle.",
    `- mediaKey must be one of: ${reactionMediaKeys.join(", ")}.`,
    "- Return JSON only.",
    "",
    "Return JSON schema:",
    JSON.stringify(
      {
        text: "string",
        evidence: ["string"],
        mood: "happy | curious | sleepy | angry | playful | hungry | shy",
        action: "idle | wave | jump | blink | sleep | cute | lookAround",
        mediaKey: "emotion_happy | emotion_curious | emotion_sleepy | emotion_angry | emotion_love | anim_idle | anim_wave | anim_jump | anim_sleep | scene_window_birds | scene_play_tunnel | scene_blanket_lick | scene_high_perch | scene_cozy_night | post_breakfast | post_window_watch | post_playtime | post_lazy_sunday | post_goodnight",
        media: {
          type: "image | animation",
          url: "string",
          frames: ["string"],
          caption: "string",
        },
        suggestedPost: {
          title: "string",
          body: "string",
          hashtags: ["string"],
        },
      },
      null,
      2,
    ),
    "",
    `Nana identity: ${identityPrompt}`,
    `Available context JSON: ${JSON.stringify(context ?? {}).slice(0, 12000)}`,
  ].join("\n");
}

function toGeminiRole(role: IncomingMessage["role"]) {
  return role === "nana" ? "model" : "user";
}

export async function POST(request: Request) {
  const body = (await request.json()) as ChatRequest;
  const message = body.message?.trim();

  if (!message && !body.image) {
    return NextResponse.json({ error: "Message or image is required." }, { status: 400 });
  }

  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return NextResponse.json(localNanaFallbackReply(message, "demo", body.locale));
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not set. Add it to .env.local or the shell running npm run dev." },
      { status: 500 },
    );
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const identityPrompt = body.identityPrompt || "Nana is a beloved pet cat.";
  const history = (body.history || [])
    .filter((item) => item.text?.trim())
    .slice(-8)
    .map((item) => ({
      role: toGeminiRole(item.role),
      parts: [{ text: item.text }],
    }));

  const userParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: message || "Please analyze this image from Nana's first-person pet perspective." },
  ];

  if (body.image?.data && body.image.mimeType) {
    userParts.push({
      inlineData: {
        mimeType: body.image.mimeType,
        data: body.image.data,
      },
    });
  }

  let geminiResponse: Response;
  try {
    geminiResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: buildSystemPrompt(identityPrompt, body.locale, body.context) }],
        },
        contents: [...history, { role: "user", parts: userParts }],
        generationConfig: {
          temperature: 0.85,
          topP: 0.95,
          maxOutputTokens: 900,
          responseMimeType: "application/json",
        },
      }),
    });
  } catch (error) {
    const errorText = error instanceof Error ? error.message : String(error);
    if (isQuotaErrorText(errorText)) {
      return NextResponse.json(localNanaFallbackReply(message, "quota", body.locale));
    }
    return NextResponse.json({ error: "Gemini API request failed." }, { status: 502 });
  }

  const dataText = await geminiResponse.text();
  let data: { error?: { message?: string }; candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> } = {};
  try {
    data = dataText ? JSON.parse(dataText) : {};
  } catch {
    data = {};
  }

  if (!geminiResponse.ok) {
    const errorText = data.error?.message || dataText || `Gemini API request failed with status ${geminiResponse.status}`;
    if (geminiResponse.status === 429 || isQuotaErrorText(errorText)) {
      return NextResponse.json(localNanaFallbackReply(message, "quota", body.locale));
    }
    return NextResponse.json({ error: errorText || "Gemini API request failed." }, { status: geminiResponse.status });
  }

  const text =
    data.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text)
      .filter(Boolean)
      .join("\n")
      .trim() || "";

  if (!text) {
    return NextResponse.json({ error: "Gemini returned an empty reply." }, { status: 502 });
  }

  try {
    return NextResponse.json(normalizeReply(JSON.parse(extractJsonObject(text)), text));
  } catch {
    return NextResponse.json(normalizeReply({ text, evidence: [], action: "idle" }, text));
  }
}
