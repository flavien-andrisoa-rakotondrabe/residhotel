import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import {
  LifeBuoy, Send, Loader2, Clock, CheckCircle2, XCircle,
  AlertTriangle, Search, ChevronDown, MessageSquare, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// ── Zod validation ────────────────────────────────────────────────────────
const adminReplySchema = z.object({
  content: z.string().trim().min(1, "Le message ne peut pas être vide").max(3000, "Message trop long"),
});

// ── Types ──────────────────────────────────────────────────────────────────
interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  category: string;
  priority: string;
  status: "open" | "in_progress" | "waiting" | "resolved" | "closed";
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
  user_avatar?: string | null;
  unread?: number;
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  content: string;
  is_admin: boolean;
  created_at: string;
  sender_name?: string;
}

// ── Config ─────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  open:        { label: "Ouvert",      icon: AlertTriangle, color: "text-accent bg-accent/10 border-accent/20" },
  in_progress: { label: "En cours",   icon: Clock,         color: "text-primary bg-primary/10 border-primary/20" },
  waiting:     { label: "En attente", icon: Clock,         color: "text-muted-foreground bg-muted border-border" },
  resolved:    { label: "Résolu",     icon: CheckCircle2,  color: "text-primary bg-primary/10 border-primary/20" },
  closed:      { label: "Fermé",      icon: XCircle,       color: "text-muted-foreground bg-muted border-border" },
};

const PRIORITY_COLOR: Record<string, string> = {
  low:    "text-muted-foreground bg-muted border-border",
  normal: "text-primary bg-primary/10 border-primary/20",
  high:   "text-accent bg-accent/10 border-accent/20",
  urgent: "text-destructive bg-destructive/10 border-destructive/20",
};

const CATEGORY_LABELS: Record<string, string> = {
  general: "Général", reservation: "Réservation", payment: "Paiement",
  account: "Compte", property: "Logement", dispute: "Litige", other: "Autre",
};

// ── Component ──────────────────────────────────────────────────────────────
export default function AdminSupport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [replyError, setReplyError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [adminNote, setAdminNote] = useState("");

  // ── Fetch all tickets ──────────────────────────────────────────────────
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["admin-support-tickets"],
    queryFn: async () => {
      const [{ data: raw, error }, { data: profiles }] = await Promise.all([
        supabase.from("support_tickets" as "support_tickets")
          .select("*")
          .order("updated_at", { ascending: false }),
        supabase.from("profiles").select("user_id,first_name,last_name,avatar_url"),
      ]);
      if (error) throw error;
      const profMap = Object.fromEntries(
        (profiles ?? []).map((p) => [
          p.user_id,
          { name: (`${p.first_name ?? ""} ${p.last_name ?? ""}`.trim()) || "Utilisateur", avatar: p.avatar_url },
        ])
      );
      return (raw ?? []).map((t) => ({
        ...t,
        status: t.status as Ticket["status"],
        user_name: profMap[t.user_id]?.name ?? "Inconnu",
        user_avatar: profMap[t.user_id]?.avatar ?? null,
      })) as Ticket[];
    },
    refetchInterval: 15000,
  });

  // ── Fetch messages ─────────────────────────────────────────────────────
  const { data: messages = [] } = useQuery({
    queryKey: ["admin-ticket-messages", selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const [{ data: raw, error }, { data: profiles }] = await Promise.all([
        supabase.from("ticket_messages" as "ticket_messages")
          .select("*")
          .eq("ticket_id", selectedId!)
          .order("created_at", { ascending: true }),
        supabase.from("profiles").select("user_id,first_name,last_name"),
      ]);
      if (error) throw error;
      const profMap = Object.fromEntries(
        (profiles ?? []).map((p) => [p.user_id, (`${p.first_name ?? ""} ${p.last_name ?? ""}`.trim()) || "Utilisateur"])
      );
      return (raw ?? []).map((m) => ({
        ...m,
        sender_name: m.is_admin ? "Admin Residotel" : (profMap[m.sender_id] ?? "Inconnu"),
      })) as TicketMessage[];
    },
    refetchInterval: 8000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const selectedTicket = tickets.find((t) => t.id === selectedId);

  // ── Send admin reply ───────────────────────────────────────────────────
  const replyMutation = useMutation({
    mutationFn: async () => {
      const parsed = adminReplySchema.safeParse({ content: reply });
      if (!parsed.success) {
        setReplyError(parsed.error.errors[0].message);
        throw new Error("validation");
      }
      setReplyError("");
      const { error } = await supabase
        .from("ticket_messages" as "ticket_messages")
        .insert({
          ticket_id: selectedId!,
          sender_id: user!.id,
          content: parsed.data.content,
          is_admin: true,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-ticket-messages", selectedId] });
      qc.invalidateQueries({ queryKey: ["admin-support-tickets"] });
      setReply("");
    },
    onError: (e: Error) => {
      if (e.message !== "validation")
        toast({ title: "Erreur d'envoi", variant: "destructive" });
    },
  });

  // ── Update ticket status ───────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async ({ status, note }: { status: Ticket["status"]; note?: string }) => {
      const { error } = await supabase
        .from("support_tickets" as "support_tickets")
        .update({
          status,
          admin_note: (note !== undefined ? note : adminNote) || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedId!);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-support-tickets"] });
      toast({ title: "Ticket mis à jour" });
    },
    onError: () => toast({ title: "Erreur mise à jour", variant: "destructive" }),
  });

  // ── Counts ─────────────────────────────────────────────────────────────
  const counts = {
    open:  tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    waiting: tickets.filter((t) => t.status === "waiting").length,
  };

  // ── Filter ─────────────────────────────────────────────────────────────
  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = !search
      || t.subject.toLowerCase().includes(q)
      || (t.user_name ?? "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">

      {/* ── KPIs ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Ouverts",   value: counts.open,        color: "amber"  },
          { label: "En cours",  value: counts.in_progress, color: "sky"    },
          { label: "En attente",value: counts.waiting,     color: "violet" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className={`font-display text-3xl font-bold text-${color}-600`}>{value}</p>
            <p className="font-body text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-5 h-[640px]">

        {/* ── Ticket list ── */}
        <div className="w-80 shrink-0 flex flex-col gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Chercher…" className="pl-9 font-body h-9" />
          </div>

          {/* Status filter tabs */}
          <div className="flex gap-1 bg-muted rounded-xl p-1 shrink-0">
            {["all","open","in_progress","waiting","resolved","closed"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`flex-1 py-1 rounded-lg font-body text-[10px] font-semibold transition-all ${
                  statusFilter === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "all" ? "Tous" : STATUS_CFG[s as keyof typeof STATUS_CFG]?.label.slice(0,4) ?? s}
              </button>
            ))}
          </div>

          {/* Ticket items */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {isLoading && <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>}
            {filtered.length === 0 && !isLoading && (
              <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                <LifeBuoy className="w-8 h-8 opacity-20" />
                <p className="font-body text-sm">Aucun ticket</p>
              </div>
            )}
            {filtered.map((t) => {
              const cfg = STATUS_CFG[t.status] ?? STATUS_CFG.open;
              const StatusIcon = cfg.icon;
              const isActive = selectedId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { setSelectedId(t.id); setAdminNote(t.admin_note ?? ""); }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isActive ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30 hover:bg-muted/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5 mb-1.5">
                    <p className="font-body text-xs font-semibold text-foreground line-clamp-1 flex-1">{t.subject}</p>
                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-body font-bold border shrink-0 ${cfg.color}`}>
                      <StatusIcon className="w-2 h-2" />{cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.user_avatar
                      ? <img src={t.user_avatar} className="w-5 h-5 rounded-full object-cover shrink-0" alt="" />
                      : <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="w-2.5 h-2.5 text-primary" />
                        </div>
                    }
                    <p className="font-body text-[10px] text-muted-foreground">{t.user_name}</p>
                    <span className={`ml-auto inline-flex px-1.5 py-0.5 rounded text-[9px] font-body font-bold border ${PRIORITY_COLOR[t.priority]}`}>
                      {t.priority}
                    </span>
                  </div>
                  <p className="font-body text-[9px] text-muted-foreground/50 mt-1">
                    {new Date(t.updated_at).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Conversation panel ── */}
        <div className="flex-1 min-w-0 bg-card border border-border rounded-2xl flex flex-col overflow-hidden">
          {!selectedTicket ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <LifeBuoy className="w-12 h-12 opacity-20" />
              <p className="font-body text-sm">Sélectionnez un ticket pour répondre</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-5 py-4 border-b border-border shrink-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {selectedTicket.user_avatar
                      ? <img src={selectedTicket.user_avatar} className="w-9 h-9 rounded-full object-cover shrink-0" alt="" />
                      : <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><User className="w-4 h-4 text-primary" /></div>
                    }
                    <div className="min-w-0">
                      <p className="font-display font-bold text-foreground line-clamp-1">{selectedTicket.subject}</p>
                      <p className="font-body text-xs text-muted-foreground">
                        {selectedTicket.user_name} · {CATEGORY_LABELS[selectedTicket.category] ?? selectedTicket.category} · #{selectedTicket.id.slice(0,8).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Quick status change */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative">
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => updateMutation.mutate({ status: e.target.value as Ticket["status"] })}
                        className="appearance-none font-body text-xs bg-background border border-border rounded-lg pl-2.5 pr-7 py-1.5 text-foreground cursor-pointer"
                      >
                        <option value="open">Ouvert</option>
                        <option value="in_progress">En cours</option>
                        <option value="waiting">En attente</option>
                        <option value="resolved">Résolu</option>
                        <option value="closed">Fermé</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Admin note */}
                <div className="mt-3 flex gap-2">
                  <input
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Note interne (non visible par l'utilisateur)…"
                    className="flex-1 font-body text-xs bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-foreground placeholder:text-muted-foreground"
                    maxLength={500}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => updateMutation.mutate({ status: selectedTicket.status, note: adminNote })}
                    disabled={updateMutation.isPending}
                  >
                    Sauver
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-muted-foreground/20 mx-auto mb-1" />
                    <p className="font-body text-xs text-muted-foreground">Aucun message</p>
                  </div>
                )}
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.is_admin ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[76%] rounded-2xl px-4 py-2.5 ${
                      m.is_admin
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/60 text-foreground"
                    }`}>
                      <p className={`font-body text-[10px] font-semibold mb-0.5 ${m.is_admin ? "text-primary-foreground/70" : "text-primary"}`}>
                        {m.sender_name}
                      </p>
                      <p className="font-body text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                      <p className={`font-body text-[10px] mt-1 ${m.is_admin ? "text-primary-foreground/50" : "text-muted-foreground"} text-right`}>
                        {new Date(m.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Reply */}
              <div className="px-5 py-3 border-t border-border shrink-0 space-y-1.5">
                {replyError && <p className="font-body text-xs text-destructive">{replyError}</p>}
                <div className="flex gap-2">
                  <Textarea
                    value={reply}
                    onChange={(e) => { setReply(e.target.value); setReplyError(""); }}
                    placeholder="Répondre au client…"
                    rows={2}
                    maxLength={3000}
                    className="resize-none font-body text-sm"
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); replyMutation.mutate(); } }}
                  />
                  <Button
                    onClick={() => replyMutation.mutate()}
                    disabled={!reply.trim() || replyMutation.isPending}
                    className="shrink-0 self-end"
                  >
                    {replyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
