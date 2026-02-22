"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertOctagon, Lock, Mail, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAdminAuth();
  const { setRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get("redirect") ?? "/admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = login(email.trim(), password);
    setLoading(false);
    if (result.success) {
      setRole(result.user.role);
      router.push(result.user.role === "ADMIN" ? redirect : "/");
    } else {
      setError(result.error ?? "Gabim në hyrje.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm"
          >
            ← Transparenca24
          </Link>
        </div>

        <Card className="border-slate-700 bg-slate-900/80 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-500 mb-2">
              <AlertOctagon className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl text-slate-100">
              Hyrje në Panelin e Administrimit
            </CardTitle>
            <CardDescription className="text-slate-400">
              Futni kredencialet e administratorit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  className={cn(
                    "rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300"
                  )}
                >
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@transparenca24.al"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 border-slate-600 bg-slate-800/50 text-slate-100 placeholder:text-slate-500 focus-visible:ring-amber-500"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">
                  Fjalëkalimi
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 border-slate-600 bg-slate-800/50 text-slate-100 placeholder:text-slate-500 focus-visible:ring-amber-500"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                disabled={loading}
              >
                {loading ? "Duke u identifikuar..." : "Hyr"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-slate-500">
              Llogaria e parazgjedhur: admin@transparenca24.al / Transparenca24!
            </p>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-500">
          Nuk keni akses?{" "}
          <Link href="/" className="text-amber-500 hover:underline">
            Kthehu në faqen kryesore
          </Link>
        </p>
      </div>
    </div>
  );
}
