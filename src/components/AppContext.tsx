"use client";

import { createContext, useContext } from "react";
import type { PetProfile } from "@/types";

interface AppContextValue {
  activePet: PetProfile;
  openPetSwitcher: () => void;
  openSettings: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppContextProvider = AppContext.Provider;

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used inside AppContextProvider");
  return context;
}
