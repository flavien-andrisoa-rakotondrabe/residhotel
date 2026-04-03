import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Scale, Send, ChevronRight, Loader2, AlertTriangle,
  CheckCircle2, Clock, XCircle, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// ── Types ──────────────────────────────────────────────────────────────────
interface Dispute {
  id: string;
  booking_id: string;
  opened_by: string;
  against_user_id: string;
  property_id: string | null;
  title: string;
  description: string | null;
  status: "open" | "in_progress" | "resolved" | "closed";
  decision: string | null;
  refund_amount: number | null;
  created_at: string;
  updated_at: string;
  opener_name?: string;
  opponent_name?: string;
}

interface DisputeMessage {
  id: string;
  dispute_id: string;
  sender_id: string;
  content: string;
  is_admin: boolean;
  created_at: string;
  sender_name?: string;
}

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CFG = {
  open:        { label: "Ouvert",      icon: AlertTriangle, color: "text-accent bg-accent/10 border-accent/20" },
  in_progress: { label: "En cours",    icon: Clock,         color: "text-primary bg-primary/10 border-primary/20" },
  resolved:    { label: "Résolu",      icon: CheckCircle2,  color: "text-primary bg-primary/10 border-primary/20" },
  closed:      { label: "Fermé",       icon: XCircle,       color: "text-muted-foreground bg-muted border-border" },
};

export default function AdminDisputes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [reply, setReply] = useState("");
  const [newDecision, setNewDecision] = useState("");
  const [newStatus, setNewStatus] = useState<Dispute["status"]>("in_progress");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // ── Fetch disputes ─────────────────────────────────────────────────────
  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ["admin-disputes"],
    queryFn: async () => {
      const [{ data: raw, error }, { data: profiles }] = await Promise.all([
        supabase.from("disputes" as "disputes").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("user_id,first_name,last_name"),
      ]);
      if (error) throw error;
      const profMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim()]));
      return (raw ?? []).map((d: Dispute) => ({
        ...d,
        opener_name: profMap[d.opened_by] || "Inconnu",
        opponent_name: profMap[d.against_user_id] || "Inconnu",
      })) as Dispute[];
    },
  });

  // ── Fetch messages for selected dispute ────────────────────────────────
  const { data: messages = [] } = useQuery({
    queryKey: ["admin-dispute-messages", selected?.id],
    enabled: !!selected,
    queryFn: async () => {
      const [{ data: raw, error }, { data: profiles }] = await Promise.all([
        supabase.from("dispute_messages" as "dispute_messages").select("*")
          .eq("dispute_id", selected!.id)
          .order("created_at", { ascending: true }),
        supabase.from("profiles").select("user_id,first_name,last_name"),
      ]);
      if (error) throw error;
      const profMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim()]));
      return (raw ?? []).map((m: DisputeMessage) => ({
        ...m,
        sender_name: m.is_admin ? "Admin Residotel" : profMap[m.sender_id] || "Inconnu",
      })) as DisputeMessage[];
    },
  });

  // ── Send admin message ─────────────────────────────────────────────────
  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!selected || !reply.trim()) return;
      const { error } = await supabase.from("dispute_messages" as "dispute_messages").insert({
        dispute_id: selected.id,
        sender_id: user!.id,
        content: reply.trim(),
        is_admin: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-dispute-messages", selected?.id] });
      setReply("");
    },
    onError: () => toast({ title: "Erreur envoi message", variant: "destructive" }),
  });

  // ── Update status + decision ───────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async ({ status, decision }: { status: Dispute["status"]; decision: string }) => {
      if (!selected) return;
      const { error } = await supabase.from("disputes" as "disputes").update({
        status,
        decision: decision || null,
        updated_at: new Date().toISOString(),
      }).eq("id", selected.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-disputes"] });
      toast({ title: "Litige mis à jour" });
      setSelected((prev) => prev ? { ...prev, status: newStatus, decision: newDecision } : null);
    },
    onError: () => toast({ title: "Erreur mise à jour", variant: "destructive" }),
  });

  // ── Counts ─────────────────────────────────────────────────────────────
  const counts = {
    all:         disputes.length,
    open:        disputes.filter((d) => d.status === "open").length,
    in_progress: disputes.filter((d) => d.status === "in_progress").length,
    resolved:    disputes.filter((d) => d.status === "resolved").length,
  };

  const filtered = statusFilter === "all" ? disputes : disputes.filter((d) => d.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* ── Summary KPIs ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { key: "open",        label: "Ouverts",   colorClass: "text-accent"   },
          { key: "in_progress", label: "En cours",  colorClass: "text-primary"  },
          { key: "resolved",    label: "Résolus",   colorClass: "text-primary"  },
          { key: "all",         label: "Total",     colorClass: "text-foreground" },
        ].map(({ key, label, colorClass }) => (
          <div key={key} className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className={`font-display text-3xl font-bold ${colorClass} mb-1`}>{counts[key as keyof typeof counts]}</p>
            <p className="font-body text-xs text-muted-foreground font-semibold uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-6 h-[620px]">
        {/* ── List ── */}
        <div className="w-80 shrink-0 flex flex-col">
          {/* Filter tabs */}
          <div className="flex gap-1 bg-muted rounded-xl p-1 mb-3">
            {["all","open","in_progress","resolved","closed"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`flex-1 py-1.5 rounded-lg font-body text-[10px] font-semibold transition-all ${
                  statusFilter === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "all" ? "Tous" : STATUS_CFG[s as keyof typeof STATUS_CFG]?.label ?? s}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {isLoading && <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>}
            {filtered.length === 0 && !isLoading && (
              <div className="text-center py-10">
                <Scale className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="font-body text-sm text-muted-foreground">Aucun litige</p>
              </div>
            )}
            {filtered.map((d) => {
              const cfg = STATUS_CFG[d.status];
              const StatusIcon = cfg.icon;
              return (
                <button
                  key={d.id}
                  onClick={() => { setSelected(d); setNewStatus(d.status); setNewDecision(d.decision ?? ""); }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    selected?.id === d.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/40 hover:bg-muted/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-body text-sm font-semibold text-foreground line-clamp-1">{d.title}</p>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-body font-semibold border shrink-0 ${cfg.color}`}>
                      <StatusIcon className="w-2.5 h-2.5" /> {cfg.label}
                    </span>
                  </div>
                  <p className="font-body text-xs text-muted-foreground">{d.opener_name} vs {d.opponent_name}</p>
                  <p className="font-body text-[10px] text-muted-foreground/60 mt-1">{new Date(d.created_at).toLocaleDateString("fr-FR")}</p>
                  {selected?.id === d.id && <ChevronRight className="w-3.5 h-3.5 text-primary mt-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Detail panel ── */}
        <div className="flex-1 min-w-0 flex flex-col bg-card border border-border rounded-2xl overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Scale className="w-12 h-12 opacity-20" />
              <p className="font-body text-sm">Sélectionnez un litige pour le gérer</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-5 py-4 border-b border-border">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="font-display font-bold text-foreground">{selected.title}</h3>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">
                      {selected.opener_name} → {selected.opponent_name} · {new Date(selected.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-body font-semibold border ${STATUS_CFG[selected.status].color}`}>
                    {selected.status in STATUS_CFG && (() => { const Ic = STATUS_CFG[selected.status].icon; return <Ic className="w-3 h-3" />; })()}
                    {STATUS_CFG[selected.status].label}
                  </span>
                </div>
                {selected.description && (
                  <p className="font-body text-sm text-muted-foreground mt-2 bg-muted/30 rounded-lg px-3 py-2">{selected.description}</p>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-6">
                    <MessageSquare className="w-8 h-8 text-muted-foreground/20 mx-auto mb-1" />
                    <p className="font-body text-xs text-muted-foreground">Aucun message</p>
                  </div>
                )}
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.is_admin ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      m.is_admin
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/60 text-foreground"
                    }`}>
                      <p className="font-body text-[10px] font-semibold mb-1 opacity-70">{m.sender_name}</p>
                      <p className="font-body text-sm">{m.content}</p>
                      <p className="font-body text-[10px] opacity-50 mt-1 text-right">{new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Admin reply */}
              <div className="px-5 py-3 border-t border-border space-y-3">
                <div className="flex gap-2">
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Répondre en tant qu'admin…"
                    className="resize-none font-body text-sm min-h-[60px]"
                  />
                  <Button
                    size="sm"
                    onClick={() => sendMutation.mutate()}
                    disabled={!reply.trim() || sendMutation.isPending}
                    className="shrink-0 self-end"
                  >
                    {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Decision panel */}
                <div className="bg-muted/30 rounded-xl p-3 space-y-2">
                  <p className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">Décision admin</p>
                  <div className="flex gap-2 flex-wrap">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as Dispute["status"])}
                      className="font-body text-xs bg-background border border-border rounded-lg px-2 py-1.5 text-foreground"
                    >
                      <option value="open">Ouvert</option>
                      <option value="in_progress">En cours</option>
                      <option value="resolved">Résolu</option>
                      <option value="closed">Fermé</option>
                    </select>
                    <input
                      value={newDecision}
                      onChange={(e) => setNewDecision(e.target.value)}
                      placeholder="Décision (optionnel)…"
                      className="flex-1 min-w-[140px] font-body text-xs bg-background border border-border rounded-lg px-3 py-1.5 text-foreground placeholder:text-muted-foreground"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateMutation.mutate({ status: newStatus, decision: newDecision })}
                      disabled={updateMutation.isPending}
                    >
                      Enregistrer
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
