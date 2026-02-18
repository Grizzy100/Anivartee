"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";

const themes = [
  { key: "system", label: "System", icon: Monitor },
  { key: "light", label: "Light", icon: Sun },
  { key: "dark", label: "Dark", icon: Moon },
] as const;

export function ToggleTheme() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-0.5 rounded-full bg-secondary/60 p-0.5 h-6" />
    );
  }

  return (
    <div className="flex items-center gap-0.5 rounded-full bg-secondary/60 p-0.5">
      {themes.map(({ key, label, icon: Icon }) => {
        const isActive = theme === key;
        return (
          <button
            key={key}
            onClick={() => setTheme(key)}
            className="relative flex items-center justify-center w-6 h-6 rounded-full transition-colors"
            aria-label={`Switch to ${label} theme`}
          >
            {isActive && (
              <motion.span
                layoutId="theme-pill"
                className="absolute inset-0 rounded-full bg-background shadow-sm border border-border"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <AnimatePresence mode="wait">
              <motion.span
                key={key}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="relative z-10"
              >
                <Icon
                  className={`w-3 h-3 transition-colors ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                />
              </motion.span>
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
}
