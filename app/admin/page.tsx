"use client";

import Link from "next/link";
import { LayoutDashboard, Inbox, Gavel, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useReports } from "@/context/ReportsContext";

export default function AdminDashboardPage() {
  const { reports } = useReports();
  const pending = reports.filter((r) => r.status === "PENDING").length;
  const underAudit = reports.filter((r) => r.status === "UNDER_AUDIT").length;
  const verified = reports.filter((r) => r.status === "E_VERIFIKUAR").length;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">
          Paneli i Kontrollit
        </h1>
        <p className="text-slate-400 mt-1">
          Mirë se vini në zonën e administrimit. Menaxhoni raportet dhe dërgonë në KLSH.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Raporte në pritje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-400">{pending}</p>
            <Link href="/admin/inbox">
              <Button variant="outline" size="sm" className="mt-2 border-slate-600 text-slate-300 hover:bg-slate-700">
                Shiko Inbox
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Nën Auditim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-400">{underAudit}</p>
            <Link href="/admin/inbox">
              <Button variant="outline" size="sm" className="mt-2 border-slate-600 text-slate-300 hover:bg-slate-700">
                Shiko Inbox
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Gavel className="h-4 w-4" />
              E verifikuara (KLSH)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-400">{verified}</p>
            <Link href="/admin/klsh">
              <Button variant="outline" size="sm" className="mt-2 border-slate-600 text-slate-300 hover:bg-slate-700">
                Hap KLSH Pipeline
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" />
            Veprime të shpejta
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/admin/inbox">
            <Button className="bg-slate-700 hover:bg-slate-600 text-slate-100">
              Inbox (Raportimet)
            </Button>
          </Link>
          <Link href="/admin/klsh">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              KLSH Pipeline
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="ghost" className="text-slate-400 hover:text-slate-200 hover:bg-slate-800">
              Cilësimet
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
