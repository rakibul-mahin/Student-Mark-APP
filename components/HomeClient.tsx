"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { AnimatePresence, m } from "framer-motion";
import {
  BookOpen,
  LogIn,
  Hash,
  Sun,
  Moon,
  LogOut,
  AlertTriangle,
  User,
} from "lucide-react";
import clsx from "clsx";
import { useTheme } from "./ThemeProvider";
import ResultsDashboard from "./ResultsDashboard";
import LoadingScreen from "./LoadingScreen";

interface StudentResult {
  studentName: string;
  tabName: string;
  marks: { label: string; value: string }[];
  courseInfo: {
    courseCode: string;
    courseTitle: string;
    facultyName: string;
    facultyInitials: string;
    semester: string;
    section: string;
  };
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="fixed top-4 right-4 p-2.5 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm transition-all z-10"
    >
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4"
    >
      <ThemeToggle />
      <div className="w-full max-w-md">
        {/* Shared header */}
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

        {children}

        <p className="text-center text-xs text-gray-400 dark:text-slate-600 mt-6">
          Your data is fetched live and never stored in this portal.
          <br />
          Developed and Maintained by rakibul-mahin [RKBM]
        </p>
      </div>
    </m.div>
  );
}

export default function HomeClient() {
  const searchParams = useSearchParams();
  const course = searchParams.get("course");
  const { data: session, status } = useSession();

  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StudentResult | null>(null);

  const inputClass =
    "w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

  async function handleViewMarks(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, course }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setResult(data as StudentResult);
      }
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // State 0: No course param — hide the card entirely
  if (!course) {
    return (
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-linear-to-br from-red-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4"
      >
        <ThemeToggle />
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="max-w-md w-full text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950 border border-red-200 dark:border-red-800 mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            Invalid Course Link
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Please use the exact portal link provided by your course instructor.
          </p>
        </m.div>
      </m.div>
    );
  }

  // State 3: Marks display — full dashboard
  if (result) {
    return (
      <>
        <AnimatePresence mode="wait">
          <ResultsDashboard
            key="dashboard"
            result={result}
            onSignOut={() => {
              setResult(null);
              setStudentId("");
              signOut({ redirect: false });
            }}
          />
        </AnimatePresence>
        <AnimatePresence>
          {loading && <LoadingScreen key="loading" />}
        </AnimatePresence>
      </>
    );
  }

  // NextAuth is still resolving session — show dots
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
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
      </div>
    );
  }

  // State 1: Course param present, not authenticated
  if (!session) {
    return (
      <PageShell>
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-blue-900/5 dark:shadow-black/40 border border-blue-100 dark:border-slate-700 p-8"
        >
          <div className="text-center mb-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Sign in with your BRACU Google account to view your marks.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-100 dark:border-slate-700">
              <BookOpen className="w-3 h-3" />
              {course}
            </div>
          </div>

          <button
            onClick={() => signIn("google")}
            className={clsx(
              "w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg",
              "font-semibold text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200",
              "border border-slate-300 dark:border-slate-600",
              "hover:bg-slate-50 dark:hover:bg-slate-700",
              "shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            )}
          >
            {/* Google logo */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </button>

          <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-4">
            Only @g.bracu.ac.bd accounts are permitted.
          </p>
        </m.div>
      </PageShell>
    );
  }

  // State 2: Authenticated, awaiting student ID
  return (
    <>
      <PageShell>
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-blue-900/5 dark:shadow-black/40 border border-blue-100 dark:border-slate-700 p-8"
        >
          {/* Google profile banner */}
          <div className="flex items-center gap-3 mb-6 p-3 bg-blue-50 dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-slate-700">
            {session.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt="Profile"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-blue-200 dark:border-slate-600"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-blue-600 dark:text-slate-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                {session.user?.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {session.user?.email}
              </p>
            </div>
          </div>

          <form onSubmit={handleViewMarks} className="space-y-5">
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
                  placeholder="Enter your Student ID to view marks"
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
              View Marks
            </button>

            <button
              type="button"
              onClick={() => signOut({ redirect: false })}
              className={clsx(
                "w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg",
                "font-medium text-sm text-slate-500 dark:text-slate-400",
                "border border-slate-200 dark:border-slate-700",
                "hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              )}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </m.div>
      </PageShell>

      <AnimatePresence>
        {loading && <LoadingScreen key="loading" />}
      </AnimatePresence>
    </>
  );
}
