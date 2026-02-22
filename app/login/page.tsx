"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAdminAuth();
  const { setRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get("redirect") ?? "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = login(email.trim(), password);
    setLoading(false);
    if (result.success) {
      setRole(result.user.role);
      if (result.user.role === "ADMIN") {
        router.push(redirect === "/" ? "/admin" : redirect);
      } else {
        router.push(redirect);
      }
    } else {
      setError(result.error ?? "Gabim në hyrje.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Transparenca24
          </Link>
        </div>

        <Card className="border-border bg-card shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Hyrje</CardTitle>
            <CardDescription>
              Futni email dhe fjalëkalimin për të hyrë
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
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@shembull.al"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Fjalëkalimi
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={loading}
              >
                {loading ? "Duke u identifikuar..." : "Hyr"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Përdorues: user@llogaria.al / Llogaria2026! — Admin: admin@transparenca24.al / Transparenca24!
            </p>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Duke vazhduar, ju pranoni përdorimin e identitetit tuaj për qëllime transparence.
        </p>
      </div>
    </div>
  );
}
