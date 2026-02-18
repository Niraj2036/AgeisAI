import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { cn } from "./../utils/cn";
import { AppShell } from "./../components/layout/app-shell";

export const metadata: Metadata = {
  title: "AI Observability | Banking Control Room",
  description:
    "Enterprise-grade AI observability for banking ML models and LLM systems."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // #region agent log
  fetch("http://127.0.0.1:7243/ingest/b6c0ecd9-2ff2-4b11-aae2-7d7ada4d6eea", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: `log_${Date.now()}_root_layout`,
      runId: "pre-fix",
      hypothesisId: "H_LAYOUT_ENTRY",
      location: "app/layout.tsx:13",
      message: "RootLayout rendered",
      data: {},
      timestamp: Date.now()
    })
  }).catch(() => {});
  // #endregion

  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          "min-h-screen bg-charcoal-900 text-foreground antialiased",
          "bg-grid-pattern bg-grid"
        )}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

