"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { AlertsSlideOver } from "./alerts-slide-over";
import { useAlertsPanelStore } from "./../../hooks/use-alerts-panel-store";

export function AppShell({ children }: { children: ReactNode }) {
  const isAlertsOpen = useAlertsPanelStore((s) => s.isOpen);

  return (
    <div className="flex h-screen w-full bg-terminal text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav />
        <main className="relative flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={typeof window !== "undefined" ? location.pathname : "page"}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="h-full overflow-y-auto px-6 pb-6 pt-4 lg:px-8 lg:pt-6"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {isAlertsOpen && (
          <motion.aside
            key="alerts-panel"
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="glass-panel fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col border-l border-border/60 bg-charcoal-900/95 shadow-2xl"
          >
            <AlertsSlideOver />
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

