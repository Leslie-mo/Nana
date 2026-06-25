"use client";

import { useEffect, useRef, useState } from "react";
import type { PetProfile } from "@/types";

const sequences = {
  idle: [0, 1, 2, 3, 4, 5, 6, 7],
  blink: [8, 9, 10, 11],
  wave: [12, 13, 14, 15, 0],
  jump: [16, 17, 18, 19, 0],
  sleep: [20, 21, 22, 23, 24],
  sleepLoop: [23, 24],
} as const;

type Mode = keyof typeof sequences;

export function FloatingPetStage({ pet }: { pet: PetProfile }) {
  const frameUrls = pet.animationFrameUrls;
  const spriteUrl = pet.animationSpriteUrl ?? pet.poseSpriteUrl;
  const [mode, setMode] = useState<Mode>("idle");
  const [frameStep, setFrameStep] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);
  const lastInteraction = useRef(Date.now());

  const sequence = sequences[mode];
  const frame = sequence[frameStep % sequence.length];
  const frameUrl = frameUrls?.[frame];

  function markActive() {
    lastInteraction.current = Date.now();
    if (mode === "sleep" || mode === "sleepLoop") {
      setMode("idle");
      setFrameStep(0);
    }
  }

  function play(nextMode: Mode) {
    markActive();
    setMode(nextMode);
    setFrameStep(0);
  }

  useEffect(() => {
    const speed = mode === "idle" ? 260 : mode === "sleepLoop" ? 900 : 150;
    const timer = window.setTimeout(() => {
      setFrameStep((current) => {
        const next = current + 1;
        if (next < sequence.length) return next;
        if (mode === "idle" || mode === "sleepLoop") return 0;
        if (mode === "sleep") {
          setMode("sleepLoop");
          return 0;
        }
        setMode("idle");
        return 0;
      });
    }, speed);
    return () => window.clearTimeout(timer);
  }, [frameStep, mode, sequence.length]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (mode !== "idle") return;
      if (Date.now() - lastInteraction.current > 30000) {
        play("sleep");
        return;
      }
      if (Math.random() > 0.68) play("blink");
    }, 4200);
    return () => window.clearInterval(timer);
  }, [mode]);

  function release() {
    setDragging(false);
    start.current = null;
    const distance = Math.abs(drag.x) + Math.abs(drag.y);
    setDrag({ x: 0, y: 0 });
    if (distance > 70) play("jump");
    window.setTimeout(() => {
      moved.current = false;
    }, 0);
  }

  if (!frameUrl && !spriteUrl) return null;

  const rotation = Math.max(-12, Math.min(12, drag.x * 0.07));

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={pet.name}
      onPointerDown={(event) => {
        markActive();
        start.current = { x: event.clientX, y: event.clientY };
        moved.current = false;
        setDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!start.current) return;
        const next = {
          x: Math.max(-90, Math.min(90, event.clientX - start.current.x)),
          y: Math.max(-60, Math.min(60, event.clientY - start.current.y)),
        };
        if (Math.abs(next.x) + Math.abs(next.y) > 5) moved.current = true;
        setDrag(next);
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onClick={() => {
        if (moved.current) return;
        play("wave");
      }}
      onDoubleClick={() => play("jump")}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") play("wave");
      }}
      className="relative h-full w-full cursor-grab touch-none overflow-visible outline-none active:cursor-grabbing"
    >
      <div className="pointer-events-none absolute inset-x-8 bottom-4 h-14 rounded-full bg-cocoa/20 blur-2xl" />
      <div
        className="floating-pet-sprite pointer-events-none absolute left-1/2 top-5 flex h-[330px] w-[330px] items-center justify-center transition-[transform] ease-out"
        style={{
          transform: `translateX(-50%) translate(${drag.x}px, ${drag.y}px) rotate(${rotation}deg) scale(${dragging ? 1.045 : 1})`,
          transitionDuration: dragging ? "0ms" : "360ms",
          filter: "drop-shadow(0 24px 20px rgba(84,52,31,.24))",
        }}
      >
        {frameUrl ? (
          <img
            src={frameUrl}
            alt=""
            draggable={false}
            className="max-h-full max-w-full select-none object-contain"
          />
        ) : (
          <SpriteFallback spriteUrl={spriteUrl!} frame={frame} />
        )}
      </div>
      <div className="avatar-glint pointer-events-none absolute right-20 top-20 h-8 w-8 rounded-full bg-white/70 blur-sm" />
      {(mode === "wave" || mode === "jump") && (
        <div className="avatar-reaction-sparkles pointer-events-none absolute inset-0">
          <i className="absolute left-16 top-24 h-3 w-3 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,.95)]" />
          <i className="absolute right-20 top-36 h-2 w-2 rounded-full bg-sand shadow-[0_0_16px_rgba(255,224,174,.95)]" />
          <i className="absolute left-1/2 top-12 h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,.95)]" />
        </div>
      )}
    </div>
  );
}

function SpriteFallback({ spriteUrl, frame }: { spriteUrl: string; frame: number }) {
  const col = frame % 5;
  const row = Math.floor(frame / 5);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <img
        src={spriteUrl}
        alt=""
        draggable={false}
        className="absolute left-0 top-0 h-[500%] w-[500%] max-w-none select-none"
        style={{
          transform: `translate3d(calc(${-col * 20}% + 3.5%), calc(${-row * 20}% + 1%), 0)`,
        }}
      />
    </div>
  );
}
