import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "WealthWise | Expense Manager",
  description: "Track expenses and incomes with style",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="d-flex min-vh-100">
          <aside className="bg-dark text-white p-4 d-flex flex-column" style={{ width: "260px" }}>
            
            {/* Logo Section */}
            <div className="mb-5 d-flex align-items-center gap-3">
              <div 
                className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                style={{ width: '48px', height: '48px', overflow: 'hidden', padding: '6px' }}
              >
                <Image 
                  src="/logo.jpg" 
                  alt="WealthWise Logo" 
                  width={40} 
                  height={40} 
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
              <h4 className="h5 mb-0 fw-bold">CashTracker</h4>
            </div>
          
            <nav className="nav flex-column gap-2">
              {[
                { name: "Dashboard", href: "/dashboard" },
                { name: "Expenses", href: "/expenses" },
                { name: "Incomes", href: "/incomes" },
                { name: "Categories", href: "/categories" },
                { name: "Sub-Categories", href: "/sub-categories" },
                { name: "Projects", href: "/projects" },
                { name: "People", href: "/people" },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="nav-link text-white px-3 py-2">
                  {item.name}
                </Link>
              ))}
            </nav>
          </aside>
          
          <main className="flex-grow-1 overflow-auto">
            <div className="container-fluid p-5">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}