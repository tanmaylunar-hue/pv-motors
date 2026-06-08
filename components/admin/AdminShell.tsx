"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Car, LayoutDashboard, LogOut, MessageSquare, ClipboardList, 
  Image as ImageIcon, Users, ScrollText, CreditCard, Database, 
  KeyRound, ShieldCheck, User, Bell, Settings2 
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";

interface AdminShellProps {
  children: React.ReactNode;
  admin: {
    username: string;
    role: "owner" | "manager";
  };
}

type Toast = {
  id: string;
  message: string;
};

export function AdminShell({ children, admin }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastCheckedTime = useRef<number>(Date.now());
  
  async function handleLogout() {
    await fetch("/api/admin/auth/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  // Poll for notifications every 8 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/admin/notifications?since=${lastCheckedTime.current}`);
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            // Update last checked timestamp to latest notification
            const times = data.map((n: any) => new Date(n.createdAt).getTime());
            lastCheckedTime.current = Math.max(...times);

            // Display toasts
            data.forEach((notif: any) => {
              const toastId = notif.id;
              
              setToasts((prev) => {
                // Prevent duplicate toast IDs if they somehow occur
                if (prev.some((t) => t.id === toastId)) return prev;
                return [...prev, { id: toastId, message: notif.message }];
              });

              // Dismiss toast after 4.5 seconds
              setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== toastId));
              }, 4500);
            });
          }
        }
      } catch (err) {
        console.error("Failed to poll notifications:", err);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Base navigation items for both Owner and Manager
  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/vehicles", label: "Vehicles", icon: Car, exact: false },
    { href: "/admin/gallery", label: "Gallery", icon: ImageIcon, exact: false },
    { href: "/admin/enquiries", label: "Enquiries", icon: MessageSquare, exact: false },
    { href: "/admin/orders", label: "Bookings", icon: ClipboardList, exact: false },
    { href: "/admin/homepage-settings", label: "Homepage Settings", icon: Settings2, exact: false },
  ];

  // Restricted items only visible and accessible to the Owner
  if (admin.role === "owner") {
    navItems.push(
      { href: "/admin/users", label: "User Management", icon: Users, exact: false },
      { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText, exact: false },
      { href: "/admin/payments", label: "Payments", icon: CreditCard, exact: false },
      { href: "/admin/database", label: "Database Config", icon: Database, exact: false },
      { href: "/admin/env", label: "Env Variables", icon: KeyRound, exact: false },
      { href: "/admin/security", label: "Security Settings", icon: ShieldCheck, exact: false }
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background relative">
      {/* Top Header Navigation */}
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3 select-none">
            <div className="relative h-10 w-10 shrink-0">
              <Image
                src="/emblem.png"
                alt="PV Motors Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.25em] text-muted font-bold leading-none">Admin Panel</p>
              <p className="font-display text-sm font-medium text-foreground mt-1 leading-none">PV Motors</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            {/* Real-time Notifications Bell indicator */}
            <div className="relative p-1 text-muted hover:text-foreground transition-all select-none">
              <Bell className="h-4.5 w-4.5" />
              {toasts.length > 0 && (
                <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-surface animate-ping" />
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground font-semibold"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[240px_1fr] sm:px-6">
        {/* Sidebar Navigation */}
        <aside className="h-fit border border-border bg-surface p-3 space-y-4 select-none">
          {/* Admin User Session Profile */}
          <div className="border-b border-border pb-3 px-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center border border-border bg-background">
              <User className="h-4 w-4 text-neutral-600" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-foreground truncate">{admin.username}</p>
              <p className="text-[9px] uppercase tracking-wider text-muted font-mono mt-0.5">{admin.role}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition-all",
                    active
                      ? "bg-foreground text-background"
                      : "text-muted hover:bg-surface-elevated hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Dashboard Main Content Body */}
        <div>{children}</div>
      </div>

      {/* Real-time Collaboration Notification Toast Notifications Panel */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none select-none max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-2.5 border border-border bg-surface/90 backdrop-blur-md text-foreground text-xs font-semibold px-4 py-3.5 shadow-xl rounded pointer-events-auto transition-all animate-in fade-in slide-in-from-bottom-5"
          >
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
