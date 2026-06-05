import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { Providers } from "./components/Providers";
import { AppShell } from "./components/AppShell";

export const metadata: Metadata = {
  title: "CashTracker | Expense Manager",
  description: "Track expenses and incomes with style",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-100">
      <body className="h-100 m-0">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
