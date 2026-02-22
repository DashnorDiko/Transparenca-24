"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Inbox,
  Gavel,
  Settings,
  AlertOctagon,
} from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Paneli i Kontrollit", icon: LayoutDashboard },
  { href: "/admin/inbox", label: "Inbox (Raportimet)", icon: Inbox },
  { href: "/admin/klsh", label: "KLSH Pipeline", icon: Gavel },
  { href: "/admin/settings", label: "Cilësimet", icon: Settings },
];

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { role } = useAuth();
  const { user, isLoading } = useAdminAuth();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return;
    if (role !== "ADMIN") {
      router.replace("/login?redirect=" + encodeURIComponent(pathname || "/admin"));
    }
  }, [role, isLoginPage, pathname, router]);

  useEffect(() => {
    if (isLoginPage) return;
    if (isLoading) return;
    if (!user) {
      router.replace("/admin/login?redirect=" + encodeURIComponent(pathname || "/admin"));
      return;
    }
    if (user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [user, isLoading, isLoginPage, pathname, router]);

  if (!isLoginPage && role !== "ADMIN") {
    return null;
  }
  if (!isLoginPage && user && user.role !== "ADMIN") {
    return null;
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-slate-400">Duke kontrolluar aksesin...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      <aside className="w-56 shrink-0 border-r border-slate-700 bg-slate-900 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h2 className="font-semibold text-slate-100 flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-amber-500" />
            Transparenca24 Admin
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Zona e kufizuar</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminAuthProvider>
  );
}
