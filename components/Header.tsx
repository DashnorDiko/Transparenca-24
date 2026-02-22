"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  User,
  Sun,
  Moon,
  FolderKanban,
  Play,
  Square,
  MessageSquare,
  Lock,
  BadgeCheck,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { useSimulation } from "@/context/SimulationContext";
import { useAuth } from "@/context/AuthContext";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { ROLE_LABELS } from "@/lib/auth";
import { t } from "@/lib/i18n";

const identifikohuLabel = "Identifikohu";

export function Header() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { locale, setLocale } = useLanguage();
  const { isRunning, startSimulation, stopSimulation } = useSimulation();
  const { role, setRole, isCitizen, isAdmin } = useAuth();
  const { logout: logoutSession } = useAdminAuth();
  const strings = t[locale];
  const isGuest = role === "GUEST";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-14 md:h-16 items-center gap-3 md:gap-6 px-3 md:px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-bold text-foreground hover:opacity-90 transition-opacity"
        >
          <span className="text-lg md:text-xl">Transparenca24</span>
        </Link>

        {/* Search - hide on very small screens if needed */}
        <div className="hidden sm:flex flex-1 max-w-sm lg:max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder={strings.searchPlaceholder}
              className="pl-9 h-9 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-gov-accent"
            />
          </div>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {isAdmin && (
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link href="/admin/inbox" className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" />
                {locale === "sq" ? "Kutia" : "Inbox"}
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={pathname === "/proposals" ? "text-gov-accent font-medium" : "text-muted-foreground hover:text-foreground"}
          >
            <Link href="/proposals" className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              {locale === "sq" ? "Propozimet" : "Proposals"}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={pathname === "/projects" ? "text-gov-accent font-medium" : "text-muted-foreground hover:text-foreground"}
          >
            <Link href="/projects" className="flex items-center gap-1.5">
              <FolderKanban className="h-4 w-4" />
              {locale === "sq" ? "Projektet" : "Projects"}
            </Link>
          </Button>
        </nav>

        {/* Simulation */}
        {isRunning ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={stopSimulation}
            className="gap-1.5 shrink-0"
          >
            <Square className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{locale === "sq" ? "Ndalo" : "Stop"}</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={startSimulation}
            className="gap-1.5 shrink-0 border-green-600/50 text-green-700 dark:text-green-400 hover:bg-green-600/10 hover:border-green-600"
          >
            <Play className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{locale === "sq" ? "Nis" : "Start"}</span>
          </Button>
        )}

        {/* Language + Theme */}
        <div className="flex items-center gap-0.5 shrink-0">
          <div className="flex rounded-md border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setLocale("sq")}
              className={`px-2 py-1.5 text-xs font-medium transition-colors ${locale === "sq" ? "bg-gov-accent text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              aria-label="Shqip"
            >
              SQ
            </button>
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`px-2 py-1.5 text-xs font-medium transition-colors ${locale === "en" ? "bg-gov-accent text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              aria-label="English"
            >
              EN
            </button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={toggle}
            aria-label={theme === "dark" ? "Ndiz dritën" : "Ndiz errësirën"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        {/* Auth: Identifikohu button or user + logout */}
        <div className="flex items-center gap-2 shrink-0 pl-1 border-l border-border">
          {isGuest ? (
            <Button asChild className="gap-2 bg-gov-accent hover:bg-gov-accent/90 text-white font-medium">
              <Link href="/login">
                <User className="h-4 w-4" />
                {identifikohuLabel}
              </Link>
            </Button>
          ) : (
            <>
              <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium">{ROLE_LABELS[role]}</span>
                {isCitizen && (
                  <BadgeCheck className="h-4 w-4 text-green-500 shrink-0" title="I verifikuar" />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  logoutSession();
                  setRole("GUEST");
                }}
                title={locale === "sq" ? "Dil" : "Log out"}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{locale === "sq" ? "Dil" : "Log out"}</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
