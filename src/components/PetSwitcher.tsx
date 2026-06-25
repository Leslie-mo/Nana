"use client";

import { Check, Plus, X } from "lucide-react";
import { useState } from "react";
import type { PetProfile } from "@/types";

export function PetSwitcher({
  pets,
  activePetId,
  onSelect,
  onAdd,
  onClose,
  t,
}: {
  pets: PetProfile[];
  activePetId: string;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onClose: () => void;
  t: (key: string) => string;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  return (
    <div className="absolute inset-0 z-[80] flex items-end bg-black/25 backdrop-blur-sm">
      <div className="w-full rounded-t-[32px] bg-cream p-5 pb-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black">{t("pets.title")}</h2>
            <p className="mt-1 text-xs text-stone-400">{t("pets.subtitle")}</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-white">
            <X size={17} />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {pets.map((pet) => (
            <button
              key={pet.id}
              onClick={() => onSelect(pet.id)}
              className="flex w-full items-center gap-3 rounded-[22px] bg-white p-3 text-left shadow-sm"
            >
              {pet.avatarImageUrl ? (
                <span
                  className="h-14 w-14 rounded-[18px] bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${pet.avatarImageUrl})`,
                    backgroundSize: pet.isAiAvatar ? "cover" : "200% auto",
                    backgroundPosition: pet.isAiAvatar ? "center" : "100% 100%",
                  }}
                />
              ) : (
                <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-cream text-cocoa">
                  <Plus size={18} />
                </span>
              )}
              <div className="flex-1">
                <strong className="text-sm">{pet.name}</strong>
                <p className="mt-1 text-[10px] text-stone-400">
                  {pet.age} {t("common.age")} · {t(pet.breedKey)}
                </p>
              </div>
              {activePetId === pet.id && (
                <span className="grid h-7 w-7 place-items-center rounded-full bg-cocoa text-white">
                  <Check size={14} />
                </span>
              )}
            </button>
          ))}
        </div>

        {adding ? (
          <form
            className="mt-4 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!name.trim()) return;
              onAdd(name.trim());
            }}
          >
            <input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("pets.namePlaceholder")}
              className="min-w-0 flex-1 rounded-2xl bg-white px-4 text-sm outline-none"
            />
            <button className="rounded-2xl bg-cocoa px-4 py-3 text-xs font-bold text-white">
              {t("pets.create")}
            </button>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[20px] border border-dashed border-cocoa/40 py-4 text-xs font-bold text-cocoa"
          >
            <Plus size={16} /> {t("pets.add")}
          </button>
        )}
      </div>
    </div>
  );
}
