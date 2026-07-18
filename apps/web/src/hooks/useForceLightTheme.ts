import { useEffect } from "react";

/**
 * Forces `<html>` out of dark mode while mounted, restoring the prior class
 * on unmount. Use on pages with a hardcoded light-only design (e.g. auth
 * screens) so a globally-persisted dark-mode preference doesn't make
 * dark:-styled shared components (like Label) render unreadable text on
 * their always-white background.
 */
export function useForceLightTheme() {
  useEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");
    root.classList.remove("dark");
    return () => {
      if (hadDark) root.classList.add("dark");
    };
  }, []);
}
