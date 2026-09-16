"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark" | "auto";
export type Theme = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  theme: Theme;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const themeListeners = new Set<() => void>();
type ViewTransitionDocument = Document & {
  startViewTransition?: (updateCallback: () => void) => void;
};

function getStoredMode(value: string | null): ThemeMode | null {
  return value === "light" || value === "dark" || value === "auto" ? value : null;
}

function subscribeToTheme(listener: () => void) {
  themeListeners.add(listener);

  return () => themeListeners.delete(listener);
}

function getModeFromDocument(): ThemeMode {
  return getStoredMode(document.documentElement.dataset.theme ?? null) ?? "auto";
}

function getThemeFromDocument(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function resolveTheme(mode: ThemeMode): Theme {
  if (mode !== "auto") {
    return mode;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyMode(mode: ThemeMode) {
  const theme = resolveTheme(mode);

  document.documentElement.dataset.theme = mode;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  document.cookie = `theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
  document.cookie = `theme-mode=${mode}; Path=/; Max-Age=31536000; SameSite=Lax`;
  sessionStorage.setItem("theme", theme);
  localStorage.setItem("theme", theme);
  sessionStorage.setItem("theme-mode", mode);
  localStorage.setItem("theme-mode", mode);
  themeListeners.forEach((listener) => listener());
}

function updateTheme(mode: ThemeMode) {
  const update = () => applyMode(mode);
  const viewTransitionDocument = document as ViewTransitionDocument;

  if (viewTransitionDocument.startViewTransition) {
    viewTransitionDocument.startViewTransition(update);
    return;
  }

  document.documentElement.classList.add("theme-transition");
  update();
  requestAnimationFrame(() => {
    document.documentElement.classList.remove("theme-transition");
  });
}

export function ThemeProvider({
  initialMode,
  initialTheme,
  children,
}: {
  initialMode: ThemeMode;
  initialTheme: Theme;
  children: ReactNode;
}) {
  const mode = useSyncExternalStore(
    subscribeToTheme,
    getModeFromDocument,
    () => initialMode,
  );
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeFromDocument,
    () => initialTheme,
  );
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (getModeFromDocument() === "auto") {
        updateTheme("auto");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const setMode = useCallback((nextMode: ThemeMode) => {
    updateTheme(nextMode);
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, theme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
