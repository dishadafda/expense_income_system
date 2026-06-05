"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  Tags,
  ListTree,
  Briefcase,
  Users,
  UserCircle,
} from "lucide-react";
import LogoutButton from "./LogoutButton";
import type { AppRole } from "@/lib/auth";

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Incomes", href: "/incomes", icon: TrendingUp },
  { name: "Categories", href: "/categories", icon: Tags },
  { name: "Sub-Categories", href: "/sub-categories", icon: ListTree },
  { name: "Projects", href: "/projects", icon: Briefcase, adminOnly: true },
  { name: "People", href: "/people", icon: Users, adminOnly: true },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function roleLabel(role: AppRole | undefined) {
  if (role === "ADMIN") return "Admin";
  if (role === "USER") return "User";
  return "Guest";
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const role = (session?.user as { role?: AppRole } | undefined)?.role;
  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || role === "ADMIN");

  const displayName =
    session?.user?.name?.trim() ||
    session?.user?.email?.split("@")[0] ||
    (status === "loading" ? "Loading…" : "Signed in user");

  const displayRole = roleLabel(role);

  return (
    <aside className="sidebar-premium d-flex flex-column text-white">
      <div className="sidebar-brand d-flex align-items-center gap-3">
        <div className="sidebar-logo-wrap">
          <Image
            src="/logo.jpg"
            alt="CashTracker Logo"
            width={40}
            height={40}
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
        <div>
          <h4 className="sidebar-brand-title mb-0">CashTracker</h4>
          <p className="sidebar-brand-subtitle mb-0">Finance workspace</p>
        </div>
      </div>

      <nav className="sidebar-nav flex-grow-1" aria-label="Main navigation">
        {visibleItems.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link d-flex justify-content-between align-items-center${active ? " sidebar-link-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <span className="sidebar-link-label">{item.name}</span>
              <Icon className="sidebar-link-icon" size={18} strokeWidth={2} aria-hidden />
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer mt-auto">
        <div className="sidebar-divider" role="separator" />
        <div className="sidebar-profile-card d-flex align-items-center gap-3">
          <div className="sidebar-avatar" aria-hidden>
            <UserCircle size={28} strokeWidth={1.75} />
          </div>
          <div className="sidebar-profile-text min-w-0">
            <p className="sidebar-profile-name mb-0 text-truncate">{displayName}</p>
            <p className="sidebar-profile-role mb-0">{displayRole}</p>
          </div>
        </div>
        <LogoutButton className="btn btn-outline-light sidebar-logout-btn w-100" />
      </div>
    </aside>
  );
}
