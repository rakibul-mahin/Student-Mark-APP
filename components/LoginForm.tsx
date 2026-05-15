"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { BookOpen, LogIn, Mail, Hash, Lock, Sun, Moon } from "lucide-react";
import clsx from "clsx";
import { useTheme } from "./ThemeProvider";

interface StudentResult {
  studentName: string;
  tabName: string;
  marks: { label: string; value: string }[];
}

interface LoginFormProps {
  onSuccess: (data: StudentResult) => void;
  onLoadingChange: (loading: boolean) => void;
}

export default function LoginForm({ onSuccess, onLoadingChange }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const { theme, toggleTheme } = useTheme();

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    onLoadingChange(true);

    try {
      const res = await fetch("/api/marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, studentId, passcode }),
      });

      const data = await res.json();

      if (!res.ok) {
        onLoadingChange(false);
        setError(data.error ?? "Something went wrong.");
      } else {
        onSuccess(data as StudentResult);
      }
    } catch {
      onLoadingChange(false);
      setError("Could not connect to the server. Please try again.");
    }
  }

  const inputClass =
    "w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4"
    >
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="fixed top-4 right-4 p-2.5 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm transition-all"
      >
        {theme === "dark" ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </button>

      <div className="w-full max-w-md">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-700 shadow-lg shadow-blue-500/30 mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100 tracking-tight">
            SyncScore
          </h1>
          <p className="mt-1 text-blue-600 dark:text-blue-400 text-sm">
            View your academic marks securely
          </p>
        </m.div>

        {/* Card */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-blue-900/5 dark:shadow-black/40 border border-blue-100 dark:border-slate-700 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5"
              >
                GSuite Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@g.bracu.ac.bd"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="studentId"
                className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5"
              >
                Student ID
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                <input
                  id="studentId"
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. 10000XXXXX or 12345678"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="passcode"
                className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5"
              >
                Passcode
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                <input
                  id="passcode"
                  type="password"
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter your 6 digit passcode"
                  className={inputClass}
                />
              </div>
            </div>

            {error && (
              <m.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg px-4 py-3 text-sm"
              >
                <span className="mt-0.5 shrink-0">⚠</span>
                <span>{error}</span>
              </m.div>
            )}

            <button
              type="submit"
              className={clsx(
                "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg",
                "font-semibold text-sm text-white bg-blue-700 hover:bg-blue-800",
                "active:scale-[0.98] shadow-md hover:shadow-lg transition-all"
              )}
            >
              <LogIn className="w-4 h-4" />
              Check Marks
            </button>
          </form>
        </m.div>

        <p className="text-center text-xs text-gray-400 dark:text-slate-600 mt-6">
          Your data is fetched live and never stored in this portal.<br></br>
          Developed and Maintained by rakibul-mahin [RKBM]
        </p>
      </div>
    </m.div>
  );
}