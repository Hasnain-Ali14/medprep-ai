"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Stethoscope,
  ShieldCheck,
} from "lucide-react";
import { SIDEBAR_NAV_ITEMS } from "@/components/layout/sidebar-nav";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpenForPath, setMobileOpenForPath] = React.useState<string | null>(null);
  const mobileOpen = mobileOpenForPath === pathname;

  const openMobileMenu = () => setMobileOpenForPath(pathname);
  const closeMobileMenu = () => setMobileOpenForPath(null);

  // Close mobile drawer on Escape key
  React.useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpenForPath(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const activeItem =
    SIDEBAR_NAV_ITEMS.find((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
    ) ?? SIDEBAR_NAV_ITEMS[0];

  const renderNavLinks = (isCompact: boolean) => (
    <nav aria-label="Primary navigation" className="flex-1 space-y-1 px-3 py-4">
      {SIDEBAR_NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            title={isCompact ? item.label : undefined}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group flex items-center rounded-lg px-2.5 py-2 text-sm transition-colors duration-150",
              isCompact ? "justify-center" : "gap-3",
              isActive
                ? "bg-[#eef3f9] font-medium text-[#0f2744]"
                : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
            )}
          >
            <Icon
              className={cn(
                "h-4.5 w-4.5 shrink-0 transition-colors",
                isActive
                  ? "text-[#0d9488]"
                  : "text-slate-400 group-hover:text-slate-600"
              )}
            />
            {!isCompact && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-slate-200/90 bg-white transition-[width] duration-200 lg:flex",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-slate-100 px-3",
            collapsed ? "justify-center" : "justify-between px-4"
          )}
        >
          <Link
            href="/"
            className="flex items-center gap-2.5 overflow-hidden focus-visible:outline-none"
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0f2744] text-white shadow-xs">
              <Stethoscope className="h-4.5 w-4.5" />
              <span
                className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#0d9488]"
                aria-hidden="true"
              />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight text-[#0f2744]">
                  MedPrep AI
                </p>
                <p className="truncate text-[11px] text-slate-500">
                  MBBS Study Platform
                </p>
              </div>
            )}
          </Link>

          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Expand toggle when collapsed (kept near top for easy reach) */}
        {collapsed && (
          <div className="flex justify-center border-b border-slate-100 py-2">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Navigation Links */}
        {renderNavLinks(collapsed)}

        {/* Sidebar Footer */}
        {!collapsed && (
          <div className="border-t border-slate-100 p-3">
            <div className="rounded-lg border border-slate-200/80 bg-slate-50/80 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-[#0f2744]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#0d9488]" />
                <span>Workspace Status</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                App shell ready. Private student accounts &amp; Supabase sync
                will connect in Milestone 2.
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <div
            className="fixed inset-0 bg-slate-900/35 backdrop-blur-[1px]"
            onClick={closeMobileMenu}
          />
          <div className="fixed inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f2744] text-white">
                  <Stethoscope className="h-4.5 w-4.5" />
                  <span
                    className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#0d9488]"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-tight text-[#0f2744]">
                    MedPrep AI
                  </p>
                  <p className="text-[11px] text-slate-500">
                    MBBS Study Platform
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={closeMobileMenu}
                aria-label="Close navigation menu"
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {renderNavLinks(false)}

            <div className="border-t border-slate-100 p-4">
              <div className="rounded-lg border border-slate-200/80 bg-slate-50/80 p-3">
                <div className="flex items-center gap-2 text-xs font-medium text-[#0f2744]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#0d9488]" />
                  <span>Workspace Status</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                  Private student accounts &amp; Supabase sync connect in
                  Milestone 2.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-200",
          collapsed ? "lg:pl-[72px]" : "lg:pl-64"
        )}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openMobileMenu}
              aria-label="Open navigation menu"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-slate-900">
                {activeItem.label}
              </span>
              <span className="hidden text-slate-300 sm:inline">/</span>
              <span className="hidden text-xs text-slate-500 sm:inline">
                {activeItem.shortDescription}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/exams"
              className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100 sm:inline-flex"
            >
              <span
                className="h-1.5 w-1.5 rounded-full bg-[#0d9488]"
                aria-hidden="true"
              />
              <span>No exam date set</span>
            </Link>
            <Link
              href="/auth"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/settings"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-[#eef3f9] text-xs font-semibold text-[#0f2744] transition-colors hover:border-[#0f2744]/30"
              title="Student Settings"
              aria-label="Student Settings"
            >
              MP
            </Link>
          </div>
        </header>

        {/* Page Container */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
