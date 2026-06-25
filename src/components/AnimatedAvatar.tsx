"use client";

import { useState } from "react";
import type { PetAvatar } from "@/types";

const reactions = ["avatar-react-bounce", "avatar-react-tilt", "avatar-react-happy"];

export function AnimatedAvatar({
  avatar,
  petName = "Pet",
  size = "large",
  className = "",
}: {
  avatar?: PetAvatar | null;
  petName?: string;
  size?: "tiny" | "small" | "medium" | "large";
  className?: string;
}) {
  const [reaction, setReaction] = useState("");
  const [reactionId, setReactionId] = useState(0);
  const sizes = {
    tiny: "h-9 w-9 rounded-full",
    small: "h-14 w-14 rounded-[20px]",
    medium: "h-24 w-24 rounded-[28px]",
    large: "h-full w-full rounded-[30px]",
  };

  function react() {
    const nextId = reactionId + 1;
    setReaction("");
    setReactionId(nextId);
    window.requestAnimationFrame(() => {
      setReaction(reactions[nextId % reactions.length]);
    });
    window.setTimeout(() => setReaction(""), 850);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Interact with ${petName}`}
      onClick={react}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") react();
      }}
      className={`avatar-stage group relative cursor-pointer overflow-hidden bg-gradient-to-br from-[#F7DDC4] via-[#F4E9DA] to-[#D9B792] outline-none ${sizes[size]} ${className}`}
    >
      <div className={`avatar-reactor h-full w-full ${reaction}`}>
        <img
          src={avatar?.avatarImageUrl ?? "/images/nana-ai-avatar.png"}
          alt={`${petName} AI Avatar`}
          draggable={false}
          className="avatar-character h-full w-full select-none object-cover object-center transition-transform duration-500 group-hover:rotate-2 group-hover:scale-105"
        />
      </div>
      <span className="avatar-glint absolute right-[27%] top-[29%] h-1.5 w-1.5 rounded-full bg-white/90" />
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cocoa/10 to-white/10" />
      {reaction && (
        <span key={reactionId} className="avatar-reaction-sparkles pointer-events-none absolute inset-0">
          <i className="absolute left-[20%] top-[24%] h-2 w-2 rounded-full bg-amber-300" />
          <i className="absolute right-[18%] top-[35%] h-1.5 w-1.5 rounded-full bg-white" />
          <i className="absolute bottom-[24%] left-[28%] h-2.5 w-2.5 rotate-45 rounded-sm bg-rose-300" />
        </span>
      )}
    </div>
  );
}
