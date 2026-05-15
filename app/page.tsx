"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import LoginForm from "@/components/LoginForm";
import ResultsDashboard from "@/components/ResultsDashboard";
import LoadingScreen from "@/components/LoadingScreen";

interface StudentResult {
  studentName: string;
  tabName: string;
  marks: { label: string; value: string }[];
}

export default function Home() {
  const [result, setResult] = useState<StudentResult | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSuccess(data: StudentResult) {
    setLoading(false);
    setResult(data);
  }

  return (
    <>
      {/* Page-level views swap with a clean wait transition */}
      <AnimatePresence mode="wait">
        {result ? (
          <ResultsDashboard
            key="dashboard"
            result={result}
            onSignOut={() => setResult(null)}
          />
        ) : (
          <LoginForm
            key="login"
            onSuccess={handleSuccess}
            onLoadingChange={setLoading}
          />
        )}
      </AnimatePresence>

      {/* Loading screen overlays independently */}
      <AnimatePresence>
        {loading && <LoadingScreen key="loading" />}
      </AnimatePresence>
    </>
  );
}