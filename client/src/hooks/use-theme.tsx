import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "midnight-ocean" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as Theme) || "light";
    }
    return "light";
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove("light", "dark", "midnight-ocean");
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
      setIsDark(systemTheme === "dark");
    } else if (theme === "midnight-ocean") {
      root.classList.add("dark", "midnight-ocean");
      setIsDark(true);
    } else if (theme === "dark") {
      root.classList.add(theme);
      setIsDark(true);
    }
    
    // Set default body background for better light mode
    if (theme === "light" || (theme === "system" && !window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.body.style.backgroundColor = "#ffffff";
    } else {
      document.body.style.backgroundColor = "#1f2937";
    }
    
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      
      const handleChange = (e: MediaQueryListEvent) => {
        const root = document.documentElement;
        root.classList.remove("light", "dark", "midnight-ocean");
        root.classList.add(e.matches ? "dark" : "light");
        setIsDark(e.matches);
      };
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}