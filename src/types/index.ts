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
}

export interface AnimatedAvatar {
  avatarId: string;
  animationType: string;
  previewUrl: string;
}

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
  text: string;
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
