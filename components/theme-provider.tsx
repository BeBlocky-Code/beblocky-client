"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

function ThemeCookieSync() {
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    if (!resolvedTheme) return;
    const theme = resolvedTheme === "dark" ? "dark" : "light";
    const hostname = window.location.hostname;
    const isBeblockyDomain = hostname.endsWith(".beblocky.com");
    const cookieBase = `beblocky_theme=${theme}; Path=/; Max-Age=${
      60 * 60 * 24 * 365
    }; SameSite=Lax`;
    document.cookie = isBeblockyDomain
      ? `${cookieBase}; Domain=.beblocky.com`
      : cookieBase;
  }, [resolvedTheme]);

  return null;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeCookieSync />
      {children}
    </NextThemesProvider>
  );
}
