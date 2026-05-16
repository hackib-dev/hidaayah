"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";

  const savedTheme = localStorage.getItem("hidaayah-theme");

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return getSystemTheme();
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // Initialize theme
  useEffect(() => {
    const initialTheme = getStoredTheme();
    setTheme(initialTheme);
    setMounted(true);
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(theme);

    localStorage.setItem("hidaayah-theme", theme);
  }, [theme, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      const savedTheme = localStorage.getItem("hidaayah-theme");

      // Only auto-update if user hasn't manually chosen
      if (!savedTheme) {
        setTheme(mediaQuery.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Prevent hydration mismatch
  if (!mounted) return null;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
