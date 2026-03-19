import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { Sidebar } from "./components/Sidebar";

export const metadata: Metadata = {
  title: "WealthWise | Expense Manager",
  description: "Track expenses and incomes with style",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="d-flex min-vh-100">
          <Sidebar />

          <main className="flex-grow-1 overflow-auto">
            <div className="container-fluid p-5">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}