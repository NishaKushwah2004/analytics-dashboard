"use client";

import { Sidebar } from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system">
      <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
        {/* Sidebar */}
        <div className="flex-shrink-0">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full">{children}</div>
        </main>
      </div>

      <Toaster position="top-right" />
      <Analytics />
    </ThemeProvider>
  );
}
