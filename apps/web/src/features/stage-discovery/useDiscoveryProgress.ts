import { useState } from "react";

const STORAGE_KEY = "viacerta:stage0-discovery";

export const DISCOVERY_MODULES = [
  { key: "welcome_video", title: "Welcome Video", subtitle: "3:20" },
  { key: "philosophy", title: "Career-First Philosophy", subtitle: "Read" },
  { key: "platform_tour", title: "Platform Tour", subtitle: "5 min" },
  { key: "success_stories", title: "Student Success Stories", subtitle: "4 read" },
  { key: "how_it_works", title: "How ViaCerta Works", subtitle: "3 min" },
  { key: "discovery_session", title: "Book Discovery Session", subtitle: "Optional" },
  { key: "checklist", title: "Knowledge Checklist", subtitle: "7/7" },
] as const;

export type DiscoveryModuleKey = (typeof DISCOVERY_MODULES)[number]["key"];

function loadCompleted(): Set<DiscoveryModuleKey> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as DiscoveryModuleKey[]) : []);
  } catch {
    return new Set();
  }
}

/** Stage 0 is pure orientation with no state-machine consequence, so its
 * completion is tracked client-side only (no backend model needed — the
 * real journey state machine starts at Stage 1). */
export function useDiscoveryProgress() {
  const [completed, setCompleted] = useState<Set<DiscoveryModuleKey>>(loadCompleted);

  const toggle = (key: DiscoveryModuleKey) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const pct = Math.round((completed.size / DISCOVERY_MODULES.length) * 100);

  return { completed, toggle, pct };
}
