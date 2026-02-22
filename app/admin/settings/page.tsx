"use client";

import { useRouter } from "next/navigation";
import { Settings as SettingsIcon, LogOut, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-100">
          <SettingsIcon className="h-8 w-8 text-slate-400" />
          Cilësimet
        </h1>
        <p className="mt-1 text-slate-400">
          Konfigurime për zonën e administrimit.
        </p>
      </div>

      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <User className="h-5 w-5" />
            Llogaria aktuale
          </CardTitle>
          <p className="text-sm text-slate-500">
            Ju jeni të identifikuar si administrator.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {user && (
            <div className="rounded-lg border border-slate-600 bg-slate-900/50 p-4 space-y-1">
              <p className="text-sm font-medium text-slate-200">{user.name}</p>
              <p className="text-sm text-slate-400">{user.email}</p>
              <p className="text-xs text-slate-500">Roli: {user.role}</p>
            </div>
          )}
          <Button
            variant="outline"
            className="border-red-900/50 text-red-400 hover:bg-red-950/30"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Dil nga llogaria
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
