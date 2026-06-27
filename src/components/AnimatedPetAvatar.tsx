"use client";

import { useEffect, useMemo, useState } from "react";
import type { NanaAction } from "@/types";

type AnimationMode = NanaAction;

const frameDurations: Record<AnimationMode, number> = {
  idle: 180,
  wave: 130,
  jump: 120,
  blink: 160,
  sleep: 220,
  cute: 150,
  lookAround: 150,
};

const sizes = {
  tiny: "h-9 w-9 rounded-full",
  small: "h-14 w-14 rounded-[20px]",
  medium: "h-24 w-24 rounded-[28px]",
  large: "h-full w-full rounded-[30px]",
};

function pickFrames(frames: string[], mode: AnimationMode) {
  const aliases: Record<AnimationMode, string[]> = {
    idle: ["idle"],
    wave: ["wave"],
    jump: ["jump"],
    blink: ["blink"],
    sleep: ["sleep", "idle"],
    cute: ["cute", "wave", "idle"],
    lookAround: ["lookAround", "look-around", "blink", "idle"],
  };
  const modeFrames = frames.filter((frame) =>
    aliases[mode].some((name) => frame.includes(`/${name}-`) || frame.includes(`${name}-`)),
  );
  if (mode === "idle") {
    const blinkFrames = frames.filter((frame) => frame.includes("/blink-") || frame.includes("blink-"));
    return modeFrames.length ? [...modeFrames, ...blinkFrames] : frames;
  }
  return modeFrames;
}

export function AnimatedPetAvatar({
  frames = [],
  fallbackAvatar = "/images/nana-ai-avatar.png",
  petName = "Pet",
  size = "large",
  className = "",
  action = "idle",
  onActivate,
}: {
  frames?: string[];
  fallbackAvatar?: string;
  petName?: string;
  size?: keyof typeof sizes;
  className?: string;
  action?: NanaAction;
  onActivate?: () => void;
}) {
  const [mode, setMode] = useState<AnimationMode>(action);
  const [frameIndex, setFrameIndex] = useState(0);
  const [failedFrames, setFailedFrames] = useState<Record<string, true>>({});
  const [reacting, setReacting] = useState(false);

  const usableFrames = useMemo(
    () => frames.filter((frame) => !failedFrames[frame]),
    [failedFrames, frames],
  );
  const activeFrames = useMemo(() => pickFrames(usableFrames, mode), [mode, usableFrames]);
  const hasFrames = activeFrames.length > 0;
  const currentFrame = hasFrames ? activeFrames[frameIndex % activeFrames.length] : fallbackAvatar;

  useEffect(() => {
    setFrameIndex(0);
  }, [mode, activeFrames.length]);

  useEffect(() => {
    setMode(action);
  }, [action]);

  useEffect(() => {
    if (!hasFrames) return;

    const timer = window.setInterval(() => {
      setFrameIndex((current) => {
        const next = current + 1;
        if (mode !== "idle" && next >= activeFrames.length) {
          window.setTimeout(() => setMode("idle"), 0);
          return 0;
        }
        return next % activeFrames.length;
      });
    }, frameDurations[mode]);

    return () => window.clearInterval(timer);
  }, [activeFrames.length, hasFrames, mode]);

  function playWave() {
    onActivate?.();
    const waveFrames = pickFrames(usableFrames, "wave");
    if (waveFrames.length) {
      setMode("wave");
      return;
    }

    setReacting(true);
    window.setTimeout(() => setReacting(false), 850);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Interact with ${petName}`}
      onClick={playWave}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") playWave();
      }}
      className={`avatar-stage group relative cursor-pointer overflow-hidden bg-gradient-to-br from-[#F7DDC4] via-[#F4E9DA] to-[#D9B792] outline-none ${sizes[size]} ${className}`}
    >
      <div className={`avatar-reactor h-full w-full ${!hasFrames ? "avatar-character" : ""} ${reacting ? "avatar-react-bounce" : ""}`}>
        <img
          src={currentFrame}
          alt={`${petName} AI Avatar`}
          draggable={false}
          onError={() => {
            if (currentFrame !== fallbackAvatar) {
              setFailedFrames((current) => ({ ...current, [currentFrame]: true }));
            }
          }}
          className="h-full w-full select-none object-contain object-center drop-shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
      <span className="avatar-glint absolute right-[27%] top-[29%] h-1.5 w-1.5 rounded-full bg-white/90" />
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cocoa/10 to-white/10" />
      {reacting && (
        <span className="avatar-reaction-sparkles pointer-events-none absolute inset-0">
          <i className="absolute left-[20%] top-[24%] h-2 w-2 rounded-full bg-amber-300" />
          <i className="absolute right-[18%] top-[35%] h-1.5 w-1.5 rounded-full bg-white" />
          <i className="absolute bottom-[24%] left-[28%] h-2.5 w-2.5 rotate-45 rounded-sm bg-rose-300" />
        </span>
      )}
    </div>
  );
}
