"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlbaniaMap } from "@/components/AlbaniaMap";
import { StatCards } from "@/components/StatCards";
import { LiveFeed } from "@/components/LiveFeed";
import { useSimulation } from "@/context/SimulationContext";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

export function LandingContent() {
  const { selectedMunicipalityId, setSelectedMunicipalityId } = useSimulation();
  const { locale } = useLanguage();
  const strings = t[locale];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gov-navy-muted/50 bg-gradient-to-b from-gov-navy via-gov-navy to-gov-navy-light/20 px-4 py-16 md:py-24">
        <div className="container mx-auto text-center">
          <motion.h1
            className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {strings.heroTitle}
          </motion.h1>
          <motion.p
            className="mx-auto mt-4 max-w-2xl text-lg text-slate-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {strings.heroSubtitle}
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button asChild size="lg" className="gap-2">
              <Link href="/dashboard">
                {strings.openDashboard}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard#transaksione">{strings.viewTransactions}</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-8">
        <StatCards />
      </section>

      {/* Map + Live Feed */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {strings.selectMunicipality}
            </h2>
            <AlbaniaMap
              selectedId={selectedMunicipalityId}
              onSelect={setSelectedMunicipalityId}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <LiveFeed municipalityId={selectedMunicipalityId} limit={12} />
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gov-navy-muted/50 bg-gov-navy-light/20 px-4 py-12">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">
            {strings.reportCtaQuestion}{" "}
            <Link
              href="/dashboard"
              className="font-medium text-gov-accent hover:underline"
            >
              {strings.reportCta}
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
