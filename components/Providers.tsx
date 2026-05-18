"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import { ThemeProvider } from "./ThemeProvider";
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <LazyMotion features={domAnimation}>{children}</LazyMotion>
      </ThemeProvider>
    </SessionProvider>
  );
}
