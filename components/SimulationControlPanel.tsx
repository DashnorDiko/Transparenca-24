"use client";

import { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Play, Square, RotateCcw, Pause, Gauge, Shield, Zap, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSimulation } from "@/context/SimulationContext";
import { useLanguage } from "@/components/LanguageProvider";
import { municipalities as getMunicipalities } from "@/lib/mock-data";

const SPEED_OPTIONS = [
  { value: 1, label: "0.5x" },
  { value: 2, label: "1x" },
  { value: 3, label: "1.5x" },
  { value: 4, label: "2x" },
];

export function SimulationControlPanel() {
  const { locale } = useLanguage();
  const {
    isRunning,
    isPaused,
    config,
    setConfig,
    startSimulation,
    stopSimulation,
    pauseSimulation,
    resumeSimulation,
    resetSimulation,
    municipalities: simMuns,
    transactions,
  } = useSimulation();

  const munOptions = useMemo(() => getMunicipalities(), []);

  const handleSpeedChange = useCallback(
    (value: string) => {
      setConfig({ speed: Number(value) });
    },
    [setConfig]
  );
  const handleCorruptionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setConfig({ corruptionProbability: e.target.valueAsNumber });
    },
    [setConfig]
  );
  const handleFrequencyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setConfig({ projectFrequency: e.target.valueAsNumber });
    },
    [setConfig]
  );
  const handleMunicipalityChange = useCallback(
    (value: string) => {
      if (value === "all") setConfig({ selectedMunicipalityIds: "all" });
      else {
        const ids = value === "none" ? [] : value.split(",").filter(Boolean);
        setConfig({ selectedMunicipalityIds: ids });
      }
    },
    [setConfig]
  );

  const municipalitySelectValue =
    config.selectedMunicipalityIds === "all"
      ? "all"
      : config.selectedMunicipalityIds.length === 0
        ? "none"
        : config.selectedMunicipalityIds.join(",");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="border-gov-navy-muted/50 bg-gov-navy-light/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            {locale === "sq" ? "Kontrolli i simulimit" : "Simulation controls"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {!isRunning ? (
              <Button
                size="sm"
                onClick={startSimulation}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4" />
                {locale === "sq" ? "Nis" : "Start"}
              </Button>
            ) : isPaused ? (
              <Button size="sm" onClick={resumeSimulation} className="gap-2">
                <Play className="h-4 w-4" />
                {locale === "sq" ? "Vazhdo" : "Resume"}
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={pauseSimulation} className="gap-2">
                <Pause className="h-4 w-4" />
                {locale === "sq" ? "Pauzë" : "Pause"}
              </Button>
            )}
            {isRunning && (
              <Button size="sm" variant="destructive" onClick={stopSimulation} className="gap-2">
                <Square className="h-4 w-4" />
                {locale === "sq" ? "Ndalo" : "Stop"}
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={resetSimulation} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              {locale === "sq" ? "Rivendos" : "Reset"}
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Zap className="h-3.5 w-3" />
                {locale === "sq" ? "Shpejtësia" : "Speed"}
              </label>
              <Select
                value={String(config.speed)}
                onValueChange={handleSpeedChange}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPEED_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={String(o.value)}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Shield className="h-3.5 w-3" />
                {locale === "sq" ? "Korrupsioni (0–1)" : "Corruption (0–1)"}
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={config.corruptionProbability}
                onChange={handleCorruptionChange}
                className="w-full h-9 accent-gov-accent"
              />
              <span className="text-xs text-muted-foreground">
                {(config.corruptionProbability * 100).toFixed(0)}%
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                {locale === "sq" ? "Frekuenca e projekteve" : "Project frequency"}
              </label>
              <input
                type="range"
                min={0.1}
                max={0.9}
                step={0.1}
                value={config.projectFrequency}
                onChange={handleFrequencyChange}
                className="w-full h-9 accent-gov-accent"
              />
              <span className="text-xs text-muted-foreground">
                {(config.projectFrequency * 100).toFixed(0)}%
              </span>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <MapPin className="h-3.5 w-3" />
                {locale === "sq" ? "Bashkitë" : "Municipalities"}
              </label>
              <Select value={municipalitySelectValue} onValueChange={handleMunicipalityChange}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {locale === "sq" ? "Të gjitha" : "All"}
                  </SelectItem>
                  <SelectItem value="none">
                    {locale === "sq" ? "Asnjë" : "None"}
                  </SelectItem>
                  {munOptions.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nameSq}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isRunning && (
            <p className="text-xs text-muted-foreground">
              {locale === "sq"
                ? `${simMuns.length} bashki · Buxheti i mbetur përditësohet në kohë reale.`
                : `${simMuns.length} municipalities · Remaining budget updates in real time.`}
            </p>
          )}
          {!isRunning && transactions.length > 0 && (
            <p className="text-xs text-muted-foreground text-green-600 dark:text-green-400">
              {locale === "sq"
                ? "Të dhënat e ruajtura u ngarkuan. Klikoni Nis për të vazhduar."
                : "Saved data loaded. Click Start to continue."}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
