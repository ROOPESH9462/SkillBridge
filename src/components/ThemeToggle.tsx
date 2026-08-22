"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 transition-all duration-200 glow-green-sm"
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-emerald-400 transition-transform transform rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 text-emerald-600 transition-transform transform rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}
