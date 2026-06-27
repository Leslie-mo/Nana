export type Locale = "zh" | "en" | "ja";
export type TabId = "home" | "social" | "ask" | "personality" | "memory";

export interface MemoryItem {
  id: string;
  date: string;
  titleKey: string;
  descriptionKey: string;
  imagePosition: string;
}

export interface Trait {
  key: string;
  value: number;
}

export interface ChatMessage {
  id: number;
  role: "user" | "nana";
  text: string;
  evidence?: string;
  evidenceItems?: string[];
  mood?: NanaMood;
  action?: NanaAction;
  media?: NanaReplyMedia;
  mediaKey?: string;
  fallbackReason?: "quota" | "demo";
  suggestedPost?: NanaSuggestedPost;
  imageUrl?: string;
  imagePosition?: string;
  socialDraft?: SocialPostDraft;
}

export interface PetAvatar {
  id: string;
  sourceImageUrl: string;
  avatarImageUrl: string;
  style: string;
  personalitySeed: string;
  createdAt: string;
  avatarSpec?: PetAvatarSpec;
  frames?: string[];
  animationType?: "idle" | "wave" | "jump";
  animationSource?: AnimatedPetAvatarResult["source"];
}

export interface AnimatedAvatar {
  avatarId: string;
  animationType: string;
  previewUrl: string;
}

export type PetAvatarSpec = {
  species: string;
  breedGuess: string;
  bodyShape: string;
  faceShape: string;
  eyeColor: string;
  furColors: string[];
  furPattern: string;
  tailShape: string;
  specialMarks: string[];
  personalityImpression: string;
  avatarPrompt: string;
  animationPrompt: string;
};

export type AnimatedPetAvatarResult = {
  avatarSpec: PetAvatarSpec;
  frames: string[];
  animationType: "idle" | "wave" | "jump";
  source: "gemini-spec-fallback-frames" | "css-fallback";
};

export type NanaMood = "happy" | "curious" | "sleepy" | "angry" | "playful" | "hungry" | "shy";

export type NanaAction = "idle" | "wave" | "jump" | "blink" | "sleep" | "cute" | "lookAround";

export type NanaReplyMedia = {
  type: "image" | "animation";
  url?: string;
  frames?: string[];
  caption?: string;
};

export type NanaSuggestedPost = {
  title: string;
  body: string;
  hashtags: string[];
};

export type NanaReply = {
  text: string;
  evidence: string[];
  mediaKey?: string;
  fallbackReason?: "quota" | "demo";
  mood?: NanaMood;
  action?: NanaAction;
  media?: NanaReplyMedia;
  suggestedPost?: NanaSuggestedPost;
};

export type NanaChatContext = {
  petProfile: unknown;
  personalityTraits: unknown;
  todayStatus: unknown;
  lifeArchive: unknown;
  memories: unknown;
  socialPosts: unknown;
  recentChatMessages: Array<{ role: "user" | "nana"; text: string }>;
};

export interface PetProfile {
  id: string;
  name: string;
  age: number;
  breedKey: string;
  mood: number;
  avatarImageUrl: string;
  memoryImageUrl: string;
  socialImageUrl: string;
  identityPrompt: string;
  animationFrameUrls?: string[];
  animationSpriteUrl?: string;
  poseSpriteUrl?: string;
  isAiAvatar: boolean;
}

export interface SocialPost {
  id: string;
  petId: string;
  petName: string;
  avatarUrl: string;
  imageUrl: string;
  imagePosition?: string;
  titleKey?: string;
  captionKey?: string;
  hashtagsKey?: string;
  title?: string;
  caption?: string;
  hashtags?: string[];
  commentList?: SocialComment[];
  likes: number;
  comments: number;
  timeKey: string;
  timeLabel?: string;
  aiGenerated: boolean;
}

export interface SocialComment {
  id: string;
  petName: string;
  avatarUrl: string;
  textKey?: string;
  text?: string;
}

export interface SocialPostDraft {
  title: string;
  caption: string;
  hashtags: string[];
  imageUrl: string;
}

export interface LifeMilestone {
  id: string;
  date: string;
  titleKey: string;
  growthDelta?: number;
}

export interface HabitInsight {
  id: string;
  textKey: string;
  growthDelta?: number;
}

export interface RelationshipMapItem {
  id: string;
  labelKey: string;
  valueKey: string;
}

export interface GrowthLog {
  id: string;
  traitKey: string;
  delta: number;
}

export interface SocialPet {
  id: string;
  name: string;
  avatarUrl: string;
  imagePosition?: string;
}

export interface HealthSignal {
  id: string;
  textKey: string;
  adviceKey: string;
}
