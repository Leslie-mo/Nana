import type { AnimatedAvatar, ChatMessage, PetAvatar, SocialPost, SocialPostDraft } from "@/types";
import { NANA_IDENTITY_PROMPT } from "@/data/mockData";

const pause = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock service boundary. Replace these functions with Gemini API / Vertex AI
// calls and persist multimodal pet memory in Firebase when moving to production.
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

export async function chatWithPetMemory(
  message: string,
  _history: ChatMessage[],
  socialImageUrl = "/images/nana-social.png",
  identityPrompt = NANA_IDENTITY_PROMPT,
) {
  await pause(500);
  const normalized = message.toLowerCase();
  const asksForImage =
    /(?:\u751f\u6210|\u770b\u770b|\u7ed9\u6211\u770b|\u7167\u7247|\u56fe\u7247|\u81ea\u62cd|\u62cd\u4e00\u5f20|\u505a\u4e2a\u52a8\u4f5c|\u505a\u52a8\u4f5c|photo|picture|image|selfie|pose|\u5199\u771f)/.test(normalized);

  if (asksForImage) {
    if (/(?:\u65c5\u884c|\u4e1c\u4eac|\u51fa\u53bb|travel|trip|tokyo)/.test(normalized)) {
      return { replyKey: "ask.replyImageTravel", imageUrl: socialImageUrl, imagePosition: "0% 100%", identityPrompt };
    }
    if (/(?:\u7761|\u8eba|\u4f11\u606f|\u5fc3\u60c5|sleep|rest|mood)/.test(normalized)) {
      return { replyKey: "ask.replyImageMood", imageUrl: socialImageUrl, imagePosition: "100% 100%", identityPrompt };
    }
    if (/(?:\u73a9|\u9017\u732b|\u73a9\u5177|play|toy)/.test(normalized)) {
      return { replyKey: "ask.replyImagePlay", imageUrl: socialImageUrl, imagePosition: "100% 0%", identityPrompt };
    }
    return { replyKey: "ask.replyImageSelfie", imageUrl: socialImageUrl, imagePosition: "0% 0%", identityPrompt };
  }

  if (/(?:\u51bb\u5e72|\u96f6\u98df|\u5403|treat|food|\u304a\u3084\u3064|\u98df\u3079)/.test(normalized)) {
    return { replyKey: "ask.replyTreat" };
  }
  if (/(?:\u5f00\u5fc3|\u5fc3\u60c5|happy|feel|\u6c17\u5206|\u3054\u304d\u3052\u3093)/.test(normalized)) {
    return { replyKey: "ask.replyHappy" };
  }
  if (/(?:\u73a9|play|\u904a\u3076)/.test(normalized)) {
    return { replyKey: "ask.replyPlay" };
  }
  if (/(?:\u60f3\u6211|\u7231\u6211|\u559c\u6b22\u6211|miss|love me|\u597d\u304d)/.test(normalized)) {
    return { replyKey: "ask.replyLove" };
  }
  return { replyKey: "ask.fixedReply" };
}

export async function generateLifeReplay(_year: string) {
  await pause(1000);
  return { status: "generated", summaryKey: "replay.summary" };
}

export async function generateSocialPostFromImage(
  imageUrl: string,
  text: string,
  petName = "Nana",
): Promise<SocialPostDraft> {
  await pause(700);

  // Future production flow:
  // 1. Gemini Vision analyzes the uploaded image and pet behavior.
  // 2. Gemini API writes a first-person pet caption and hashtags.
  // 3. Firebase stores the source image, generated copy and post metadata.
  return {
    title: `${petName} 窗边观察员`,
    caption:
      text.trim() ||
      "今天窗外来了三只小鸟。我假装不在意，其实已经认真观察了 35 分钟。",
    hashtags: ["#猫猫日记", "#窗边观察员", "#AI宠物圈"],
    imageUrl,
  };
}

export async function analyzePetBehaviorFromImage(_imageUrl: string) {
  await pause();
  // Later: Gemini Vision detects posture, activity, emotion and environment.
  return { behavior: "window-watching", mood: "curious", confidence: 0.9 };
}

export async function updatePetMemoryFromPost(_post: SocialPost) {
  await pause();
  // Later: write derived memories, habit signals and embeddings to Firebase.
  return { updated: true, memoryEventId: `memory-${Date.now()}` };
}

export async function generateLifeArchive(_petId: string) {
  await pause();
  // Later: Vertex AI / Gemini summarizes long-term multimodal memory into
  // milestones, habit insights, relationship maps, growth logs and health signals.
  return { archiveVersion: "mock-2026-06", generatedAt: new Date().toISOString() };
}

export async function generatePetAvatar(
  imageFile: File,
  identityPrompt = NANA_IDENTITY_PROMPT,
): Promise<PetAvatar> {
  await pause(1800);
  const sourceImageUrl = URL.createObjectURL(imageFile);

  // Production pipeline:
  // 1. Gemini Vision analyzes species, markings, expression and pose.
  // 2. Imagen receives identityPrompt as a hard identity lock. For Nana this
  //    includes her exact face, markings, chubby proportions and short kinked
  //    Japanese bobtail. It must never invent a long tail or redesign her.
  // 3. Firebase Storage stores source and generated assets.
  return {
    id: `nana-avatar-${Date.now()}`,
    sourceImageUrl,
    avatarImageUrl: sourceImageUrl,
    style: "tabby-white-3d-digital-character",
    personalitySeed: `curious-calm-charming-slightly-sassy | ${identityPrompt}`,
    createdAt: new Date().toISOString(),
  };
}

export async function animatePetAvatar(avatar: PetAvatar): Promise<AnimatedAvatar> {
  await pause(450);

  // Future versions can use Veo or another animation model to generate
  // short idle loops. The mock uses CSS motion around the generated image.
  return {
    avatarId: avatar.id,
    animationType: "idle-float-blink-breathe",
    previewUrl: avatar.avatarImageUrl,
  };
}
