import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Expense & Income Manager",
  description: "Track expenses and incomes with role-based access",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="d-flex min-vh-100">
          <aside className="bg-dark text-white p-3" style={{ width: "260px" }}>
            <div className="mb-4">
              <h4 className="h5 mb-0">Expense Manager</h4>
              <small className="text-muted">Dashboard</small>
            </div>
            <nav className="nav flex-column gap-1">
              <Link href="/dashboard" className="nav-link text-white">
                Dashboard
              </Link>
              <Link href="/expenses" className="nav-link text-white">
                Expenses
              </Link>
              <Link href="/incomes" className="nav-link text-white">
                Incomes
              </Link>
              <Link href="/categories" className="nav-link text-white">
                Categories
              </Link>
              <Link href="/sub-categories" className="nav-link text-white">
                Sub-Categories
              </Link>
              <Link href="/projects" className="nav-link text-white">
                Projects
              </Link>
              <Link href="/people" className="nav-link text-white">
                People
              </Link>
            </nav>
          </aside>
          <main className="flex-grow-1 bg-light">
            <div className="container-fluid py-4">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
