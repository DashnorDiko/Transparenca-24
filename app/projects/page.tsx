"use client";

import Link from "next/link";
import { useSimulation } from "@/context/SimulationContext";
import { formatLek } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";
import type { SimulationProject } from "@/lib/simulation-types";

const STATUS_LABELS: Record<SimulationProject["status"], string> = {
  Draft: "Draft",
  Bidding: "Bidding",
  Evaluation: "Evaluation",
  InProgress: "In progress",
  Completed: "Completed",
  Reported: "Reported",
};

export default function ProjectsPage() {
  const { projects, municipalities } = useSimulation();
  const { locale } = useLanguage();
  const strings = t[locale];

  const getMunName = (id: string) =>
    municipalities.find((m) => m.id === id)?.nameSq ?? id;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {locale === "sq" ? "Lista e projekteve" : "Project list"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {locale === "sq"
              ? "Të gjitha projektet e bashkive. Klikoni për detaje."
              : "All municipality projects. Click for details."}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-md border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
        >
          {strings.dashboard}
        </Link>
      </div>

      <Card className="border-2 border-slate-500 bg-slate-800/80">
        <CardHeader>
          <CardTitle className="text-white">
            {locale === "sq" ? "Projektet" : "Projects"} ({projects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="py-8 text-center text-slate-400">
              {locale === "sq"
                ? "Nuk ka projekte ende. Nisni simulimin nga Dashboard."
                : "No projects yet. Start the simulation from the Dashboard."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-600 hover:bg-transparent">
                  <TableHead className="text-slate-300">{strings.institution}</TableHead>
                  <TableHead className="text-slate-300">{strings.category}</TableHead>
                  <TableHead className="text-slate-300">{strings.amount}</TableHead>
                  <TableHead className="text-slate-300">{strings.status}</TableHead>
                  <TableHead className="w-[100px] text-slate-300">
                    {locale === "sq" ? "Veprime" : "Actions"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.id} className="border-slate-600">
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{p.title}</p>
                        <p className="text-xs text-slate-400">{getMunName(p.municipalityId)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{p.category}</TableCell>
                    <TableCell className="text-blue-400 font-medium">
                      {formatLek(p.allocatedBudget)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          p.status === "Reported"
                            ? "text-amber-400"
                            : p.status === "Completed"
                              ? "text-green-400"
                              : "text-slate-300"
                        }
                      >
                        {STATUS_LABELS[p.status]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/projects/${p.id}`}
                        className="text-sm font-medium text-blue-400 hover:underline"
                      >
                        {locale === "sq" ? "Shiko" : "View"}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
