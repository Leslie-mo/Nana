import type { NanaAction, NanaMood } from "@/types";

export type ReactionMediaKey =
  | "emotion_happy"
  | "emotion_curious"
  | "emotion_sleepy"
  | "emotion_angry"
  | "emotion_love"
  | "anim_idle"
  | "anim_wave"
  | "anim_jump"
  | "anim_sleep"
  | "scene_window_birds"
  | "scene_play_tunnel"
  | "scene_blanket_lick"
  | "scene_high_perch"
  | "scene_cozy_night"
  | "post_breakfast"
  | "post_window_watch"
  | "post_playtime"
  | "post_lazy_sunday"
  | "post_goodnight";

export const reactionAssets = {
  profiles: [
    "/reaction/nana_profile_1.png",
    "/reaction/nana_profile_2.png",
    "/reaction/nana_profile_3.png",
  ],
  emotions: {
    happy: "/reaction/nana_emotion_happy.png",
    curious: "/reaction/nana_emotion_curious.png",
    sleepy: "/reaction/nana_emotion_sleepy.png",
    angry: "/reaction/nana_emotion_angry.png",
    love: "/reaction/nana_emotion_love.png",
  },
  animations: {
    idle: [
      "/reaction/nana_anim_idle_1.png",
      "/reaction/nana_anim_idle_2.png",
      "/reaction/nana_anim_idle_3.png",
      "/reaction/nana_anim_idle_4.png",
    ],
    wave: [
      "/reaction/nana_anim_wave_1.png",
      "/reaction/nana_anim_wave_2.png",
      "/reaction/nana_anim_wave_3.png",
      "/reaction/nana_anim_wave_4.png",
    ],
    jump: [
      "/reaction/nana_anim_jump_1.png",
      "/reaction/nana_anim_jump_2.png",
      "/reaction/nana_anim_jump_3.png",
      "/reaction/nana_anim_jump_4.png",
    ],
    sleep: [
      "/reaction/nana_anim_sleep_1.png",
      "/reaction/nana_anim_sleep_2.png",
      "/reaction/nana_anim_sleep_3.png",
      "/reaction/nana_anim_sleep_4.png",
    ],
  },
  scenes: {
    windowBirds: "/reaction/nana_scene_window_birds.png",
    playTunnel: "/reaction/nana_scene_play_tunnel.png",
    blanketLick: "/reaction/nana_scene_blanket_lick.png",
    highPerch: "/reaction/nana_scene_high_perch.png",
    cozyNight: "/reaction/nana_scene_cozy_night.png",
  },
  posts: {
    breakfast: "/reaction/nana_post_breakfast.png",
    windowWatch: "/reaction/nana_post_window_watch.png",
    playtime: "/reaction/nana_post_playtime.png",
    lazySunday: "/reaction/nana_post_lazy_sunday.png",
    goodnight: "/reaction/nana_post_goodnight.png",
  },
} as const;

export const reactionMediaKeys: ReactionMediaKey[] = [
  "emotion_happy",
  "emotion_curious",
  "emotion_sleepy",
  "emotion_angry",
  "emotion_love",
  "anim_idle",
  "anim_wave",
  "anim_jump",
  "anim_sleep",
  "scene_window_birds",
  "scene_play_tunnel",
  "scene_blanket_lick",
  "scene_high_perch",
  "scene_cozy_night",
  "post_breakfast",
  "post_window_watch",
  "post_playtime",
  "post_lazy_sunday",
  "post_goodnight",
];

export function mediaKeyForMood(mood?: NanaMood): ReactionMediaKey {
  if (mood === "happy" || mood === "playful") return "emotion_happy";
  if (mood === "sleepy") return "emotion_sleepy";
  if (mood === "angry") return "emotion_angry";
  if (mood === "shy") return "emotion_love";
  return "emotion_curious";
}

export function mediaKeyForAction(action?: NanaAction): ReactionMediaKey {
  if (action === "wave") return "anim_wave";
  if (action === "jump" || action === "cute") return "anim_jump";
  if (action === "sleep") return "anim_sleep";
  return "anim_idle";
}

export function reactionMediaForKey(mediaKey?: string) {
  switch (mediaKey as ReactionMediaKey | undefined) {
    case "emotion_happy":
      return { type: "image" as const, url: reactionAssets.emotions.happy };
    case "emotion_curious":
      return { type: "image" as const, url: reactionAssets.emotions.curious };
    case "emotion_sleepy":
      return { type: "image" as const, url: reactionAssets.emotions.sleepy };
    case "emotion_angry":
      return { type: "image" as const, url: reactionAssets.emotions.angry };
    case "emotion_love":
      return { type: "image" as const, url: reactionAssets.emotions.love };
    case "anim_wave":
      return { type: "animation" as const, frames: reactionAssets.animations.wave };
    case "anim_jump":
      return { type: "animation" as const, frames: reactionAssets.animations.jump };
    case "anim_sleep":
      return { type: "animation" as const, frames: reactionAssets.animations.sleep };
    case "scene_window_birds":
      return { type: "image" as const, url: reactionAssets.scenes.windowBirds };
    case "scene_play_tunnel":
      return { type: "image" as const, url: reactionAssets.scenes.playTunnel };
    case "scene_blanket_lick":
      return { type: "image" as const, url: reactionAssets.scenes.blanketLick };
    case "scene_high_perch":
      return { type: "image" as const, url: reactionAssets.scenes.highPerch };
    case "scene_cozy_night":
      return { type: "image" as const, url: reactionAssets.scenes.cozyNight };
    case "post_breakfast":
      return { type: "image" as const, url: reactionAssets.posts.breakfast };
    case "post_window_watch":
      return { type: "image" as const, url: reactionAssets.posts.windowWatch };
    case "post_playtime":
      return { type: "image" as const, url: reactionAssets.posts.playtime };
    case "post_lazy_sunday":
      return { type: "image" as const, url: reactionAssets.posts.lazySunday };
    case "post_goodnight":
      return { type: "image" as const, url: reactionAssets.posts.goodnight };
    case "anim_idle":
    default:
      return { type: "animation" as const, frames: reactionAssets.animations.idle };
  }
}
