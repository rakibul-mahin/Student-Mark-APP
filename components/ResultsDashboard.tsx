"use client";

import { m, type Variants } from "framer-motion";
import { BookOpen, LogOut, Award, FileText, Sun, Moon, UserRound, CalendarDays, Users } from "lucide-react";
import clsx from "clsx";
import { useTheme } from "./ThemeProvider";

interface MarkEntry {
  label: string;
  value: string;
}

interface CourseInfo {
  courseCode: string;
  courseTitle: string;
  facultyName: string;
  facultyInitials: string;
  semester: string;
  section: string;
}

interface StudentResult {
  studentName: string;
  tabName: string;
  marks: MarkEntry[];
  courseInfo: CourseInfo;
}

interface ResultsDashboardProps {
  result: StudentResult;
  onSignOut: () => void;
}

function cardType(label: string): "total" | "grade" | null {
  const l = label.toLowerCase();
  if (l.includes("total") || l.includes("sum") || l.includes("grand")) return "total";
  if (l.includes("grade") || l.includes("gpa") || l.includes("letter")) return "grade";
  return null;
}

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32 } },
};

export default function ResultsDashboard({ result, onSignOut }: ResultsDashboardProps) {
  const { studentName, tabName, marks, courseInfo } = result;
  const { theme, toggleTheme } = useTheme();

  const totalCards = marks.filter((m) => cardType(m.label) === "total").length;
  const gradeCards = marks.filter((m) => cardType(m.label) === "grade").length;

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950"
    >
      {/* Top Nav */}
      <header className="bg-blue-700 dark:bg-slate-900 border-b border-transparent dark:border-slate-800 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/15 rounded-xl p-2">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold leading-tight">SyncScore</p>
              <p className="text-blue-200 dark:text-slate-400 text-xs leading-tight">
                Academic Marks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome banner */}
        <m.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 mb-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Welcome, {studentName}
              </h2>
              <div className="flex items-center gap-2 mt-1.5">
                <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                  {tabName}
                </span>
              </div>
            </div>

            {/* Stats chips */}
            <div className="flex flex-wrap gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                <Award className="w-3.5 h-3.5" />
                {marks.length} entries
              </span>
              {totalCards > 0 && (
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                  {totalCards} total
                </span>
              )}
              {gradeCards > 0 && (
                <span className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                  {gradeCards} grade
                </span>
              )}
            </div>
          </div>
        </m.div>

        {/* Course info card */}
        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="bg-blue-700 dark:bg-slate-800 rounded-2xl border border-blue-600 dark:border-slate-700 shadow-sm px-6 py-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Course code + title */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-bold text-white tracking-tight">
                  {courseInfo.courseCode}
                </span>
                <span className="text-blue-200 dark:text-slate-400 text-sm">|</span>
                <span className="text-blue-100 dark:text-slate-200 font-medium text-sm">
                  {courseInfo.courseTitle}
                </span>
              </div>

              {/* Faculty */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <UserRound className="w-3.5 h-3.5 text-blue-300 dark:text-slate-400 shrink-0" />
                <span className="text-blue-100 dark:text-slate-300 text-sm">
                  {courseInfo.facultyName}
                  {courseInfo.facultyInitials && (
                    <span className="text-blue-300 dark:text-slate-500 ml-1">
                      [{courseInfo.facultyInitials}]
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Semester + Section chips */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-white/15 dark:bg-slate-700 text-white dark:text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-full">
                <CalendarDays className="w-3.5 h-3.5" />
                {courseInfo.semester}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/15 dark:bg-slate-700 text-white dark:text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-full">
                <Users className="w-3.5 h-3.5" />
                Section {courseInfo.section}
              </span>
            </div>
          </div>
        </m.div>

        {/* Marks grid */}
        <m.div
          variants={gridVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          {marks.map((entry, idx) => {
            const type = cardType(entry.label);

            return (
              <m.div
                key={idx}
                variants={cardVariants}
                className={clsx(
                  "relative rounded-xl border-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow group",
                  type === "total" &&
                    "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700",
                  type === "grade" &&
                    "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700",
                  !type &&
                    "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                )}
              >
                {/* Top accent line */}
                <div
                  className={clsx(
                    "h-1 absolute top-0 inset-x-0",
                    type === "total" && "bg-emerald-400 dark:bg-emerald-500",
                    type === "grade" && "bg-indigo-400 dark:bg-indigo-500",
                    !type && "bg-blue-400 dark:bg-blue-500"
                  )}
                />

                <div className="p-4 pt-5">
                  {type && (
                    <span
                      className={clsx(
                        "absolute top-3 right-2.5 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full",
                        type === "total"
                          ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
                          : "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300"
                      )}
                    >
                      {type}
                    </span>
                  )}

                  <p
                    className={clsx(
                      "text-[11px] font-semibold uppercase tracking-wide leading-snug mb-1.5 pr-8",
                      type === "total"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : type === "grade"
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-slate-500 dark:text-slate-400"
                    )}
                  >
                    {entry.label}
                  </p>

                  <p
                    className={clsx(
                      "text-2xl font-bold leading-none",
                      type === "total"
                        ? "text-emerald-800 dark:text-emerald-200"
                        : type === "grade"
                        ? "text-indigo-800 dark:text-indigo-200"
                        : "text-slate-800 dark:text-slate-100"
                    )}
                  >
                    {entry.value}
                  </p>
                </div>
              </m.div>
            );
          })}
        </m.div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-10">
          Data is fetched live from the grade sheet. Sign out and log in again to refresh.
        </p>
      </main>
    </m.div>
  );
}
