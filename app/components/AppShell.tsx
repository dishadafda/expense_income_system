"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

const PUBLIC_PATHS = new Set(["/", "/login"]);

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.has(pathname);

  if (isPublic) {
    return <div className="public-route min-vh-100">{children}</div>;
  }

  return (
    <div className="app-shell d-flex vh-100 overflow-hidden">
      <Sidebar />
      <main className="app-main flex-grow-1 overflow-y-auto">
        <div className="app-main-inner w-100">{children}</div>
      </main>
    </div>
  );
}
