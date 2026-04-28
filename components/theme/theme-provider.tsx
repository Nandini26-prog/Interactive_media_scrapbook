"use client";

import * as React from "react";

export type ThemeName = "nostalgia" | "chaos";

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "prestige-farewell:theme";

function applyThemeToDom(theme: ThemeName) {
  if (typeof document === "undefined") return;
  document.body.dataset.theme = theme;
}

export function ThemeProvider({
  children,
  defaultTheme = "nostalgia",
}: {
  children: React.ReactNode;
  defaultTheme?: ThemeName;
}) {
  const [theme, setThemeState] = React.useState<ThemeName>(defaultTheme);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeName | null;
    if (stored === "nostalgia" || stored === "chaos") setThemeState(stored);
  }, []);

  React.useEffect(() => {
    applyThemeToDom(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = React.useCallback((next: ThemeName) => {
    setThemeState(next);
  }, []);

  const toggleTheme = React.useCallback(() => {
    setThemeState((t) => (t === "nostalgia" ? "chaos" : "nostalgia"));
  }, []);

  const value = React.useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

