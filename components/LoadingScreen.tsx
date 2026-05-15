"use client";

import { m } from "framer-motion";
import { GraduationCap } from "lucide-react";

const CARD_COUNT = 6;

export default function LoadingScreen() {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-slate-950 px-6"
    >
      {/* Floating icon */}
      <m.div
        animate={{ y: [-6, 6, -6] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        className="w-20 h-20 rounded-2xl bg-blue-700 flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-8"
      >
        <GraduationCap className="w-10 h-10 text-white" />
      </m.div>

      {/* Title */}
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1 tracking-tight">
          Fetching Your Marks
        </h2>
        <p className="text-blue-500 dark:text-blue-400 text-sm">
          Searching across all sections…
        </p>
      </m.div>

      {/* Skeleton mark cards */}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-3 gap-3 w-72 mb-8"
      >
        {Array.from({ length: CARD_COUNT }).map((_, i) => (
          <m.div
            key={i}
            initial={{ opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.07, duration: 0.35 }}
            className="h-20 rounded-xl bg-blue-50 dark:bg-slate-800 border-2 border-blue-100 dark:border-slate-700 shimmer-card"
          >
            <div className="p-3 space-y-2">
              <div className="h-2 w-14 rounded-full bg-blue-100 dark:bg-slate-700 animate-pulse" />
              <div className="h-5 w-8 rounded bg-blue-200 dark:bg-slate-600 animate-pulse" />
            </div>
          </m.div>
        ))}
      </m.div>

      {/* Bouncing dots */}
      <div className="flex gap-2.5">
        {[0, 1, 2].map((i) => (
          <m.span
            key={i}
            animate={{ y: [0, -9, 0] }}
            transition={{
              repeat: Infinity,
              duration: 0.85,
              delay: i * 0.17,
              ease: "easeInOut",
            }}
            className="block w-2.5 h-2.5 rounded-full bg-blue-500 dark:bg-blue-400"
          />
        ))}
      </div>
    </m.div>
  );
}