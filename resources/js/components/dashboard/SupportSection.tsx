import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import {
  LifeBuoy, Plus, Send, ChevronRight, Loader2,
  Clock, CheckCircle2, XCircle, AlertTriangle, MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// ── Zod schemas ───────────────────────────────────────────────────────────
const newTicketSchema = z.object({
  subject: z.string().trim().min(5, "Sujet trop court (min. 5 car.)").max(120, "Sujet trop long (max. 120 car.)"),
  category: z.enum(["reservation","payment","account","property","dispute","other","general"]),
  priority: z.enum(["low","normal","high","urgent"]),
  message: z.string().trim().min(10, "Message trop court (min. 10 car.)").max(2000, "Message trop long (max. 2000 car.)"),
});

const replySchema = z.object({
  content: z.string().trim().min(1, "Le message ne peut pas être vide").max(2000, "Message trop long"),
});

type NewTicketData = z.infer<typeof newTicketSchema>;

// ── Config ────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  open:        { label: "Ouvert",      icon: AlertTriangle, color: "text-accent bg-accent/10 border-accent/20" },
  in_progress: { label: "En cours",   icon: Clock,         color: "text-primary bg-primary/10 border-primary/20" },
  waiting:     { label: "En attente", icon: Clock,         color: "text-muted-foreground bg-muted border-border" },
  resolved:    { label: "Résolu",     icon: CheckCircle2,  color: "text-primary bg-primary/10 border-primary/20" },
  closed:      { label: "Fermé",      icon: XCircle,       color: "text-muted-foreground bg-muted border-border" },
};

const CATEGORIES = [
  { value: "general",     label: "Général" },
  { value: "reservation", label: "Réservation" },
  { value: "payment",     label: "Paiement" },
  { value: "account",     label: "Mon compte" },
  { value: "property",    label: "Logement" },
  { value: "dispute",     label: "Litige" },
  { value: "other",       label: "Autre" },
];

const PRIORITIES = [
  { value: "low",    label: "Faible" },
  { value: "normal", label: "Normal" },
  { value: "high",   label: "Élevé" },
  { value: "urgent", label: "Urgent" },
];

// ── Component ─────────────────────────────────────────────────────────────
export default function SupportSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<"list" | "new" | "thread">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [replyError, setReplyError] = useState("");
  const [form, setForm] = useState<Partial<NewTicketData>>({
    category: "general",
    priority: "normal",
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof NewTicketData, string>>>({});

  // ── Fetch tickets ──────────────────────────────────────────────────────
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["my-tickets", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets" as "support_tickets")
        .select("*")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // ── Fetch messages for selected ticket ─────────────────────────────────
  const { data: messages = [] } = useQuery({
    queryKey: ["ticket-messages", selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_messages" as "ticket_messages")
        .select("*")
        .eq("ticket_id", selectedId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    refetchInterval: 8000,
  });

  // Scroll to bottom when messages load
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const selectedTicket = tickets.find((t) => t.id === selectedId);

  // ── Create ticket ──────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (data: NewTicketData) => {
      const { data: ticket, error } = await supabase
        .from("support_tickets" as "support_tickets")
        .insert({
          user_id: user!.id,
          subject: data.subject,
          category: data.category,
          priority: data.priority,
        })
        .select()
        .single();
      if (error) throw error;

      // Insert opening message
      const { error: msgErr } = await supabase
        .from("ticket_messages" as "ticket_messages")
        .insert({
          ticket_id: ticket.id,
          sender_id: user!.id,
          content: data.message,
          is_admin: false,
        });
      if (msgErr) throw msgErr;
      return ticket;
    },
    onSuccess: (ticket) => {
      qc.invalidateQueries({ queryKey: ["my-tickets", user?.id] });
      toast({ title: "Ticket ouvert avec succès" });
      setSelectedId(ticket.id);
      setView("thread");
      setForm({ category: "general", priority: "normal" });
      setFormErrors({});
    },
    onError: () => toast({ title: "Erreur lors de la création", variant: "destructive" }),
  });

  // ── Send reply ─────────────────────────────────────────────────────────
  const replyMutation = useMutation({
    mutationFn: async (content: string) => {
      const parsed = replySchema.safeParse({ content });
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
          is_admin: false,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ticket-messages", selectedId] });
      setReply("");
    },
    onError: (e: Error) => {
      if (e.message !== "validation")
        toast({ title: "Erreur d'envoi", variant: "destructive" });
    },
  });

  // ── Handle new ticket submit ───────────────────────────────────────────
  const handleSubmit = () => {
    const parsed = newTicketSchema.safeParse(form);
    if (!parsed.success) {
      const errs: typeof formErrors = {};
      parsed.error.errors.forEach((e) => {
        if (e.path[0]) errs[e.path[0] as keyof NewTicketData] = e.message;
      });
      setFormErrors(errs);
      return;
    }
    setFormErrors({});
    createMutation.mutate(parsed.data);
  };

  // ── VIEW: List ─────────────────────────────────────────────────────────
  if (view === "list") return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Support & Aide</h2>
          <p className="font-body text-sm text-muted-foreground mt-0.5">Suivez vos demandes d'assistance</p>
        </div>
        <Button onClick={() => setView("new")} className="gap-2">
          <Plus className="w-4 h-4" /> Nouveau ticket
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && tickets.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <LifeBuoy className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="font-display font-semibold text-foreground mb-1">Aucun ticket</p>
          <p className="font-body text-sm text-muted-foreground mb-4">Vous n'avez pas encore ouvert de demande d'assistance.</p>
          <Button onClick={() => setView("new")} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" /> Ouvrir un ticket
          </Button>
        </div>
      )}

      {!isLoading && tickets.length > 0 && (
        <div className="space-y-3">
          {tickets.map((t) => {
            const cfg = STATUS_CFG[t.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.open;
            const StatusIcon = cfg.icon;
            return (
              <button
                key={t.id}
                onClick={() => { setSelectedId(t.id); setView("thread"); }}
                className="w-full bg-card border border-border hover:border-primary/40 rounded-2xl p-4 text-left transition-all group"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-body font-semibold border ${cfg.color}`}>
                        <StatusIcon className="w-2.5 h-2.5" />{cfg.label}
                      </span>
                      <span className="font-body text-[10px] text-muted-foreground uppercase tracking-wide">
                        {CATEGORIES.find((c) => c.value === t.category)?.label ?? t.category}
                      </span>
                    </div>
                    <p className="font-body text-sm font-semibold text-foreground line-clamp-1">{t.subject}</p>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">
                      Ouvert le {new Date(t.created_at).toLocaleDateString("fr-FR")} · Mis à jour {new Date(t.updated_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── VIEW: New ticket form ──────────────────────────────────────────────
  if (view === "new") return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setView("list")} className="gap-1.5 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Button>
      </div>
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Nouveau ticket</h2>
        <p className="font-body text-sm text-muted-foreground">Notre équipe vous répondra dans les meilleurs délais.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        {/* Subject */}
        <div className="space-y-1.5">
          <label className="font-body text-sm font-semibold text-foreground">Sujet *</label>
          <Input
            value={form.subject ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
            placeholder="Décrivez brièvement votre problème…"
            maxLength={120}
            className="font-body"
          />
          {formErrors.subject && <p className="font-body text-xs text-destructive">{formErrors.subject}</p>}
        </div>

        {/* Category + Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="font-body text-sm font-semibold text-foreground">Catégorie *</label>
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as NewTicketData["category"] }))}
              className="w-full font-body text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            >
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            {formErrors.category && <p className="font-body text-xs text-destructive">{formErrors.category}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="font-body text-sm font-semibold text-foreground">Priorité</label>
            <select
              value={form.priority}
              onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as NewTicketData["priority"] }))}
              className="w-full font-body text-sm bg-background border border-border rounded-lg px-3 py-2 text-foreground"
            >
              {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label className="font-body text-sm font-semibold text-foreground">Message *</label>
          <Textarea
            value={form.message ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
            placeholder="Décrivez votre problème en détail…"
            maxLength={2000}
            rows={5}
            className="font-body resize-none"
          />
          <div className="flex items-center justify-between">
            {formErrors.message
              ? <p className="font-body text-xs text-destructive">{formErrors.message}</p>
              : <span />
            }
            <p className="font-body text-xs text-muted-foreground">{(form.message ?? "").length}/2000</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setView("list")} className="flex-1">Annuler</Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending} className="flex-1 gap-2">
            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Envoyer
          </Button>
        </div>
      </div>
    </div>
  );

  // ── VIEW: Thread ───────────────────────────────────────────────────────
  if (view === "thread" && selectedTicket) {
    const cfg = STATUS_CFG[selectedTicket.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.open;
    const StatusIcon = cfg.icon;
    const isClosed = selectedTicket.status === "closed" || selectedTicket.status === "resolved";

    return (
      <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[700px]">
        {/* Header */}
        <div className="shrink-0 flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setView("list")} className="gap-1.5 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> Mes tickets
            </Button>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-body font-semibold border ${cfg.color}`}>
            <StatusIcon className="w-3 h-3" /> {cfg.label}
          </span>
        </div>

        <div className="bg-card border border-border rounded-2xl flex flex-col flex-1 overflow-hidden">
          {/* Ticket info bar */}
          <div className="px-5 py-3 border-b border-border bg-muted/20 shrink-0">
            <p className="font-display font-semibold text-foreground line-clamp-1">{selectedTicket.subject}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="font-body text-xs text-muted-foreground">
                {CATEGORIES.find((c) => c.value === selectedTicket.category)?.label}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="font-body text-xs text-muted-foreground">
                #{selectedTicket.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
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
              <div key={m.id} className={`flex ${m.is_admin ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${
                  m.is_admin
                    ? "bg-muted/60 text-foreground"
                    : "bg-primary text-primary-foreground"
                }`}>
                  {m.is_admin && (
                    <p className="font-body text-[10px] font-semibold text-primary mb-0.5">Support Residotel</p>
                  )}
                  <p className="font-body text-sm leading-relaxed">{m.content}</p>
                  <p className={`font-body text-[10px] mt-1 ${m.is_admin ? "text-muted-foreground" : "text-primary-foreground/60"} text-right`}>
                    {new Date(m.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Reply input */}
          {isClosed ? (
            <div className="px-5 py-4 border-t border-border bg-muted/20 shrink-0">
              <p className="font-body text-sm text-muted-foreground text-center">
                Ce ticket est {selectedTicket.status === "resolved" ? "résolu" : "fermé"}. Ouvrez un nouveau ticket si besoin.
              </p>
            </div>
          ) : (
            <div className="px-5 py-3 border-t border-border shrink-0 space-y-1.5">
              {replyError && <p className="font-body text-xs text-destructive">{replyError}</p>}
              <div className="flex gap-2">
                <Textarea
                  value={reply}
                  onChange={(e) => { setReply(e.target.value); setReplyError(""); }}
                  placeholder="Votre réponse…"
                  rows={2}
                  maxLength={2000}
                  className="resize-none font-body text-sm"
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); replyMutation.mutate(reply); } }}
                />
                <Button
                  onClick={() => replyMutation.mutate(reply)}
                  disabled={!reply.trim() || replyMutation.isPending}
                  className="shrink-0 self-end"
                >
                  {replyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
              <p className="font-body text-[10px] text-muted-foreground">Entrée pour envoyer · Maj+Entrée pour sauter une ligne</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
