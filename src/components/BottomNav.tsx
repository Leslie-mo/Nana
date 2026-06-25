import {
  Clock3,
  House,
  Images,
  MessageCircleHeart,
  PawPrint,
} from "lucide-react";
import type { TabId } from "@/types";

const navItems = [
  { id: "home", labelKey: "nav.home", icon: House },
  { id: "social", labelKey: "nav.social", icon: Images },
  { id: "ask", labelKey: "nav.ask", icon: MessageCircleHeart },
  { id: "personality", labelKey: "nav.personality", icon: PawPrint },
  { id: "memory", labelKey: "nav.memory", icon: Clock3 },
] as const;

export function BottomNav({
  active,
  onChange,
  t,
}: {
  active: TabId;
  onChange: (tab: TabId) => void;
  t: (key: string) => string;
}) {
  return (
    <nav className="absolute inset-x-0 bottom-0 z-30 grid h-[76px] grid-cols-5 border-t border-stone-200/70 bg-white/95 px-2 pb-2 pt-2 backdrop-blur-xl">
      {navItems.map(({ id, labelKey, icon: Icon }) => {
        const selected = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl text-[10px] transition ${
              selected ? "font-bold text-cocoa" : "text-stone-400"
            }`}
          >
            <span className={selected ? "rounded-xl bg-sand/50 p-1.5" : "p-1.5"}>
              <Icon size={19} strokeWidth={selected ? 2.5 : 1.8} />
            </span>
            {t(labelKey)}
          </button>
        );
      })}
    </nav>
  );
}
