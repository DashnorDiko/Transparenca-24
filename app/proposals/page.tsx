"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PlusCircle, ThumbsUp, ArrowLeft, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProposalsAndVoting } from "@/context/ProposalsAndVotingContext";
import { useAuth } from "@/context/AuthContext";
import { formatLek } from "@/lib/utils";
import { PROPOSAL_STATUS_LABELS } from "@/lib/proposals-types";
import type { CitizenProposal } from "@/lib/proposals-types";
import { toast } from "sonner";

function formatDateAlbanian(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("sq-AL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function ProposalsPage() {
  const { isGuest } = useAuth();
  const {
    proposals,
    addProposal,
    supportProposal,
    incrementProposalVotes,
  } = useProposalsAndVoting();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const handleAddProposal = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) {
        toast.error("Vendosni një titull.");
        return;
      }
      addProposal(title.trim(), description.trim());
      setTitle("");
      setDescription("");
      setFormOpen(false);
      toast.success("Propozimi u shtua! Tani mund të mblidhë mbulësues.");
    },
    [title, description, addProposal]
  );

  const handleSupport = useCallback(
    (p: CitizenProposal) => {
      if (isGuest) {
        toast.warning("⚠️ Ky veprim kërkon identifikim për të parandaluar abuzimet.");
        return;
      }
      const result = supportProposal(p.id);
      if (result.success) {
        toast.success("Vota juaj u regjistrua!");
      } else {
        toast.error(result.error);
      }
    },
    [supportProposal, isGuest]
  );

  const handleVoteSupport = useCallback(
    (p: CitizenProposal) => {
      if (isGuest) {
        toast.warning("⚠️ Ky veprim kërkon identifikim zyrtar për të parandaluar abuzimet.");
        return;
      }
      if (p.status === "Proposed") {
        incrementProposalVotes(p.id);
        toast.success("Vota juaj u regjistrua!");
      }
    },
    [incrementProposalVotes, isGuest]
  );

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Kthehu te Dashboard
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Propozimet e Qytetarëve
        </h1>
        <p className="mt-1 text-muted-foreground">
          Mbështetni propozimet dhe propozoni projekte të reja. Votimi është falas.
        </p>
      </div>

      {/* Propozo një Projekt */}
      <Card className="mb-8 border-gov-navy-muted/50 bg-gov-navy-light/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Propozo një Projekt
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Parashtroni një propozim të ri. Pas pragut të mbulësuesve, administrata do t&apos;i caktojë koston.
          </p>
        </CardHeader>
        <CardContent>
          {!formOpen ? (
            <Button onClick={() => setFormOpen(true)} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Shto propozim të ri
            </Button>
          ) : (
            <form onSubmit={handleAddProposal} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Titulli
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="p.sh. Ndriçim LED në sheshet qendrore"
                  className="w-full rounded-md border border-gov-navy-muted bg-gov-navy/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gov-accent"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Përshkrimi
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Përshkruani shkurtimisht projektin..."
                  rows={3}
                  className="w-full rounded-md border border-gov-navy-muted bg-gov-navy/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gov-accent"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Dërgo propozimin</Button>
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                  Anulo
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Lista e propozimeve */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Lista e propozimeve
        </h2>
        {proposals.length === 0 ? (
          <Card className="border-gov-navy-muted/50 bg-gov-navy-light/30">
            <CardContent className="py-12 text-center text-muted-foreground">
              Nuk ka propozime ende. Shtoni të parin!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {proposals.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border-gov-navy-muted/50 bg-gov-navy-light/30">
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <CardTitle className="text-base">{p.title}</CardTitle>
                      <Badge variant="outline" className="shrink-0">
                        {PROPOSAL_STATUS_LABELS[p.status]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDateAlbanian(p.createdAt)} · Pragu i mbështetjes: {p.threshold} vota
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-medium text-foreground">
                        {p.votesCount} / {p.threshold} vota
                      </span>
                      {p.estimatedCost > 0 && (
                        <span className="text-sm text-gov-accent">
                          Kosto: {formatLek(p.estimatedCost)}
                        </span>
                      )}
                      {p.status === "Proposed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          title={isGuest ? "Identifikohuni për të votuar" : undefined}
                          onClick={() => handleVoteSupport(p)}
                        >
                          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                          <ThumbsUp className="h-3.5 w-3.5" />
                          Mbështet
                        </Button>
                      )}
                      {p.status === "FinalVote" && (
                        <Button
                          size="sm"
                          className="gap-1"
                          title={isGuest ? "Identifikohuni për të votuar" : undefined}
                          onClick={() => handleSupport(p)}
                        >
                          <Lock className="h-3.5 w-3.5" />
                          <ThumbsUp className="h-3.5 w-3.5" />
                          Voto / Mbështet
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
