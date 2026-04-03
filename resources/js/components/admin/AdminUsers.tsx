import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search, Shield, Home, Compass, UserCheck, UserX, Loader2,
  ChevronLeft, ChevronRight, BadgeCheck, BadgeX, Clock, HelpCircle,
  ChevronDown, Filter, Phone, MapPin, Globe, Calendar, CreditCard,
  Building2, Hash, FileText, Banknote, Languages, User,
  ExternalLink, Star, Ban, RotateCcw, MessageSquare,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// ── Types ──────────────────────────────────────────────────────────────────
interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  kyc_status: string;
  created_at: string;
  avatar_url: string | null;
  is_suspended: boolean;
  // extended fields
  bio: string | null;
  nationality: string | null;
  languages: string[];
  address: string | null;
  postal_code: string | null;
  date_of_birth: string | null;
  currency: string;
  fiscal_type: string | null;
  company_name: string | null;
  siret: string | null;
  vat_number: string | null;
  billing_address: string | null;
  iban: string | null;
  payout_method: string | null;
}

interface UserRole { user_id: string; role: string; }

// ── Configs ────────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  voyageur: { label: "Voyageur", icon: Compass, className: "bg-secondary text-secondary-foreground border-border" },
  hote:     { label: "Hôte",     icon: Home,    className: "bg-accent/10 text-accent border-accent/20" },
  admin:    { label: "Admin",    icon: Shield,  className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const KYC_CFG: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  non_soumis: { label: "Non soumis", icon: HelpCircle,  className: "text-muted-foreground bg-muted border-border" },
  en_cours:   { label: "En cours",   icon: Clock,       className: "text-accent bg-accent/10 border-accent/20" },
  validé:     { label: "Validé ✓",   icon: BadgeCheck,  className: "text-primary bg-primary/10 border-primary/20" },
  refusé:     { label: "Refusé",     icon: BadgeX,      className: "text-destructive bg-destructive/10 border-destructive/20" },
};

const KYC_STATUSES = ["all", "non_soumis", "en_cours", "validé", "refusé"] as const;
const PAGE_SIZE = 12;

// ── Field Row helper ───────────────────────────────────────────────────────
function FieldRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="font-body text-sm text-foreground break-all">{value}</p>
      </div>
    </div>
  );
}

// ── Section header helper ──────────────────────────────────────────────────
function DrawerSection({ title }: { title: string }) {
  return (
    <div className="pt-4 pb-1">
      <p className="font-body text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{title}</p>
      <Separator className="mt-1" />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function AdminUsers() {
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  const [kycFilter, setKycFilter] = useState<string>("all");
  const [selected, setSelected]   = useState<Profile | null>(null);
  // Suspension dialog state
  const [suspendDialog, setSuspendDialog] = useState<{ userId: string; suspend: boolean; name: string } | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user: adminUser } = useAuth();

  // ── Fetch profiles (full fields) ────────────────────────────────────────
  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`id,user_id,first_name,last_name,phone,city,country,kyc_status,created_at,avatar_url,is_suspended,
                 bio,nationality,languages,address,postal_code,date_of_birth,currency,
                 fiscal_type,company_name,siret,vat_number,billing_address,iban,payout_method`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  const { data: allRoles = [] } = useQuery({
    queryKey: ["admin-all-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("user_id,role");
      if (error) throw error;
      return data as UserRole[];
    },
  });

  // Bookings count for selected user
  const { data: userBookings = [] } = useQuery({
    queryKey: ["admin-user-bookings", selected?.user_id],
    enabled: !!selected,
    queryFn: async () => {
      if (!selected) return [];
      const { data, error } = await supabase
        .from("bookings")
        .select("id,property_title,check_in,check_out,total,status,created_at")
        .eq("traveler_id", selected.user_id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  // Properties count for selected user (host)
  const { data: userProperties = [] } = useQuery({
    queryKey: ["admin-user-properties", selected?.user_id],
    enabled: !!selected,
    queryFn: async () => {
      if (!selected) return [];
      const { data, error } = await supabase
        .from("properties")
        .select("id,title,location,price,rating,reviews,active")
        .eq("host_id", selected.user_id)
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const rolesMap = allRoles.reduce<Record<string, string[]>>((acc, r) => {
    if (!acc[r.user_id]) acc[r.user_id] = [];
    acc[r.user_id].push(r.role);
    return acc;
  }, {});

  // ── Helper: write an audit log entry ────────────────────────────────────
  const writeLog = (action: string, entityId: string, details: Record<string, unknown>) =>
    supabase.from("admin_logs").insert({
      admin_id: adminUser!.id,
      action,
      entity_type: "user",
      entity_id: entityId,
      details: { ...details, performed_at: new Date().toISOString() },
    }).then(({ error }) => {
      if (error) console.warn("[admin_logs] insert failed:", error.message);
    });

  // ── Mutations ────────────────────────────────────────────────────────────
  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: "voyageur" | "hote" | "admin" }) => {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
      await writeLog("role_added", userId, { role, target_user_id: userId });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-all-roles"] }); toast({ title: "Rôle ajouté" }); },
    onError:   () => toast({ title: "Erreur", description: "Impossible d'ajouter le rôle", variant: "destructive" }),
  });

  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as "voyageur" | "hote" | "admin");
      if (error) throw error;
      await writeLog("role_removed", userId, { role, target_user_id: userId });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-all-roles"] }); toast({ title: "Rôle retiré" }); },
    onError:   () => toast({ title: "Erreur", description: "Impossible de retirer le rôle", variant: "destructive" }),
  });

  const kycMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ kyc_status: status, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      if (error) throw error;
      if (status === "validé") {
        const existing = rolesMap[userId] ?? [];
        if (!existing.includes("hote")) {
          await supabase.from("user_roles").insert({ user_id: userId, role: "hote" as const });
        }
      }
      // Audit log for KYC decision
      await writeLog("kyc_status_updated", userId, { kyc_status: status, target_user_id: userId });
    },
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
      qc.invalidateQueries({ queryKey: ["admin-all-roles"] });
      setSelected((prev) => prev ? { ...prev, kyc_status: status } : prev);
      const msg =
        status === "validé"   ? "Hôte certifié ✓ — rôle hôte activé" :
        status === "refusé"   ? "KYC refusé" :
        status === "en_cours" ? "KYC marqué en cours" :
        "Statut KYC mis à jour";
      toast({ title: msg });
    },
    onError: () => toast({ title: "Erreur KYC", variant: "destructive" }),
  });

  const suspendMutation = useMutation({
    mutationFn: async ({ userId, suspend, reason }: { userId: string; suspend: boolean; reason?: string }) => {
      // 1. Update profile suspension status
      const { error } = await supabase
        .from("profiles")
        .update({ is_suspended: suspend, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      if (error) throw error;

      // 2. Write audit log to admin_logs for legal traceability
      const action = suspend ? "account_suspended" : "account_reactivated";
      const { error: logError } = await supabase.from("admin_logs").insert({
        admin_id: adminUser!.id,
        action,
        entity_type: "user",
        entity_id: userId,
        details: {
          suspended: suspend,
          reason: reason || null,
          target_user_id: userId,
          performed_at: new Date().toISOString(),
        },
      });
      if (logError) console.warn("[admin_logs] insert failed:", logError.message);

      // 3. Fire-and-forget email notification via edge function
      supabase.functions.invoke("notify-account-status", {
        body: {
          userId,
          action: suspend ? "suspended" : "reactivated",
          reason: reason || undefined,
        },
      }).catch((e) => console.warn("[notify-account-status] failed silently:", e));
    },
    onSuccess: (_, { suspend }) => {
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
      setSelected((prev) => prev ? { ...prev, is_suspended: suspend } : prev);
      setSuspendDialog(null);
      setSuspendReason("");
      toast({
        title: suspend ? "Compte suspendu 🚫" : "Suspension levée ✓",
        description: "Un email de notification a été envoyé à l'utilisateur.",
      });
    },
    onError: () => toast({ title: "Erreur suspension", variant: "destructive" }),
  });

  // Helper to open the suspend confirmation dialog
  const openSuspendDialog = (userId: string, suspend: boolean, name: string) => {
    setSuspendReason("");
    setSuspendDialog({ userId, suspend, name });
  };

  // ── Filter & paginate ─────────────────────────────────────────────────────
  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    const name = `${p.first_name ?? ""} ${p.last_name ?? ""}`.toLowerCase();
    const matchSearch = !search || name.includes(q) || p.city?.toLowerCase().includes(q) || p.phone?.includes(q) || p.user_id.includes(q);
    const matchKyc = kycFilter === "all" || p.kyc_status === kycFilter;
    return matchSearch && matchKyc;
  });

  const total      = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const kycCounts = profiles.reduce<Record<string, number>>((acc, p) => {
    acc[p.kyc_status] = (acc[p.kyc_status] ?? 0) + 1;
    return acc;
  }, {});

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* KYC summary chips */}
      <div className="flex flex-wrap gap-2">
        {KYC_STATUSES.filter((s) => s !== "all").map((s) => {
          const cfg = KYC_CFG[s];
          const Icon = cfg.icon;
          const count = kycCounts[s] ?? 0;
          return (
            <button
              key={s}
              onClick={() => { setKycFilter(kycFilter === s ? "all" : s); setPage(1); }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body font-semibold border transition-all ${
                kycFilter === s
                  ? cfg.className + " ring-2 ring-offset-1 ring-current/30"
                  : "text-muted-foreground bg-muted border-border hover:border-primary/30"
              }`}
            >
              <Icon className="w-3 h-3" />
              {cfg.label}
              {count > 0 && (
                <span className="ml-0.5 bg-current/15 rounded-full px-1.5 py-px text-[10px] font-bold">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Nom, ville, téléphone, ID…"
            className="pl-9 font-body"
          />
        </div>
        {kycFilter !== "all" && (
          <button
            onClick={() => setKycFilter("all")}
            className="flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Filter className="w-3.5 h-3.5" /> Effacer filtre
          </button>
        )}
        <p className="font-body text-sm text-muted-foreground ml-auto">{total} utilisateur{total > 1 ? "s" : ""}</p>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                {["Utilisateur", "Contact", "Localisation", "Certification", "Rôles", "Inscrit le", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {profilesLoading && (
                <tr><td colSpan={7} className="px-4 py-10 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></td></tr>
              )}
              {!profilesLoading && paginated.map((p) => {
                const roles   = rolesMap[p.user_id] ?? [];
                const isHost  = roles.includes("hote");
                const isAdmin = roles.includes("admin");
                const initials = `${p.first_name?.[0] ?? ""}${p.last_name?.[0] ?? ""}`.toUpperCase() || "?";
                const kycCfg  = KYC_CFG[p.kyc_status] ?? KYC_CFG.non_soumis;
                const KycIcon = kycCfg.icon;
                const isPending = kycMutation.isPending || addRoleMutation.isPending || removeRoleMutation.isPending || suspendMutation.isPending;

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-muted/20 transition-colors cursor-pointer ${p.is_suspended ? "bg-destructive/5" : ""}`}
                    onClick={() => setSelected(p)}
                  >
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center overflow-hidden shrink-0 ${p.is_suspended ? "bg-destructive/15 ring-2 ring-destructive/30" : "bg-primary/10"}`}>
                          {p.avatar_url
                            ? <img src={p.avatar_url} alt={initials} className="w-full h-full object-cover" />
                            : <span className={`font-display font-bold text-xs ${p.is_suspended ? "text-destructive" : "text-primary"}`}>{initials}</span>
                          }
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-body font-semibold text-foreground">
                              {p.first_name ?? "—"} {p.last_name ?? ""}
                            </p>
                            {p.is_suspended && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-px rounded-full text-[10px] font-bold font-body bg-destructive/10 text-destructive border border-destructive/20">
                                <Ban className="w-2.5 h-2.5" /> Suspendu
                              </span>
                            )}
                          </div>
                          <p className="font-body text-[11px] text-muted-foreground truncate max-w-[140px]">
                            {p.user_id.slice(0, 12)}…
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3">
                      {p.phone
                        ? <span className="font-body text-xs text-foreground flex items-center gap-1"><Phone className="w-3 h-3 text-muted-foreground" />{p.phone}</span>
                        : <span className="font-body text-xs text-muted-foreground">—</span>
                      }
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3 font-body text-sm text-muted-foreground whitespace-nowrap">
                      {[p.city, p.country].filter(Boolean).join(", ") || "—"}
                    </td>

                    {/* KYC dropdown */}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-body font-semibold border transition-all hover:opacity-80 ${kycCfg.className}`}
                            disabled={isPending}
                          >
                            <KycIcon className="w-3 h-3" />
                            {kycCfg.label}
                            <ChevronDown className="w-2.5 h-2.5 ml-0.5 opacity-60" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-52">
                          <DropdownMenuLabel className="font-body text-xs">Changer le statut KYC</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="font-body text-sm gap-2 cursor-pointer" onClick={() => kycMutation.mutate({ userId: p.user_id, status: "en_cours" })} disabled={p.kyc_status === "en_cours"}>
                            <Clock className="w-3.5 h-3.5 text-accent" /> Marquer en cours
                          </DropdownMenuItem>
                          <DropdownMenuItem className="font-body text-sm gap-2 cursor-pointer text-primary focus:text-primary focus:bg-primary/10" onClick={() => kycMutation.mutate({ userId: p.user_id, status: "validé" })} disabled={p.kyc_status === "validé"}>
                            <BadgeCheck className="w-3.5 h-3.5" /> Certifier hôte ✓
                            {!isHost && <span className="ml-auto text-[10px] text-muted-foreground">(active rôle hôte)</span>}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="font-body text-sm gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => kycMutation.mutate({ userId: p.user_id, status: "refusé" })} disabled={p.kyc_status === "refusé"}>
                            <BadgeX className="w-3.5 h-3.5" /> Refuser
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="font-body text-sm gap-2 cursor-pointer text-muted-foreground" onClick={() => kycMutation.mutate({ userId: p.user_id, status: "non_soumis" })} disabled={p.kyc_status === "non_soumis"}>
                            <HelpCircle className="w-3.5 h-3.5" /> Réinitialiser
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>

                    {/* Roles */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {roles.length === 0 && <span className="font-body text-xs text-muted-foreground">—</span>}
                        {roles.map((r) => {
                          const cfg = ROLE_CONFIG[r];
                          if (!cfg) return null;
                          return (
                            <span key={r} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border font-body ${cfg.className}`}>
                              <cfg.icon className="w-2.5 h-2.5" />
                              {cfg.label}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 font-body text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString("fr-FR")}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 flex-wrap">
                        {!isHost ? (
                          <Button size="sm" variant="outline" className="h-7 text-xs font-body gap-1 border-accent/20 text-accent hover:bg-accent/10" onClick={() => addRoleMutation.mutate({ userId: p.user_id, role: "hote" })} disabled={isPending}>
                            <UserCheck className="w-3 h-3" /> Hôte
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="h-7 text-xs font-body gap-1 border-destructive/20 text-destructive hover:bg-destructive/10" onClick={() => removeRoleMutation.mutate({ userId: p.user_id, role: "hote" })} disabled={isPending}>
                            <UserX className="w-3 h-3" /> Retirer hôte
                          </Button>
                        )}
                        {!isAdmin ? (
                          <Button size="sm" variant="outline" className="h-7 text-xs font-body gap-1 border-destructive/20 text-destructive hover:bg-destructive/10" onClick={() => addRoleMutation.mutate({ userId: p.user_id, role: "admin" })} disabled={isPending}>
                            <Shield className="w-3 h-3" /> Admin
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="h-7 text-xs font-body gap-1 text-muted-foreground hover:bg-muted" onClick={() => removeRoleMutation.mutate({ userId: p.user_id, role: "admin" })} disabled={isPending}>
                            <UserX className="w-3 h-3" /> Retirer admin
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="h-7 text-xs font-body gap-1" onClick={() => setSelected(p)}>
                          <ExternalLink className="w-3 h-3" /> Fiche
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!profilesLoading && paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center font-body text-muted-foreground">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between gap-3">
            <p className="font-body text-xs text-muted-foreground">Page {page} / {totalPages}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Fiche client drawer ────────────────────────────────────────────── */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
          {selected && (() => {
            const roles   = rolesMap[selected.user_id] ?? [];
            const initials = `${selected.first_name?.[0] ?? ""}${selected.last_name?.[0] ?? ""}`.toUpperCase() || "?";
            const kycCfg  = KYC_CFG[selected.kyc_status] ?? KYC_CFG.non_soumis;
            const KycIcon = kycCfg.icon;
            const isPending = kycMutation.isPending || suspendMutation.isPending;

            return (
              <>
                {/* Suspension banner */}
                {selected.is_suspended && (
                  <div className="bg-destructive px-6 py-2.5 flex items-center gap-2">
                    <Ban className="w-4 h-4 text-white shrink-0" />
                    <p className="font-body text-white text-xs font-semibold">Ce compte est suspendu — accès bloqué</p>
                  </div>
                )}
                {/* Header */}
                <div className="bg-primary px-6 pt-8 pb-6">
                  <SheetHeader className="text-left mb-4">
                    <SheetTitle className="text-white font-display text-lg">Fiche client</SheetTitle>
                  </SheetHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center overflow-hidden shrink-0 border-2 border-white/30">
                      {selected.avatar_url
                        ? <img src={selected.avatar_url} alt={initials} className="w-full h-full object-cover" />
                        : <span className="font-display text-white font-bold text-lg">{initials}</span>
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-white font-bold text-xl leading-tight">
                        {selected.first_name ?? "—"} {selected.last_name ?? ""}
                      </p>
                      <p className="font-body text-white/60 text-xs mt-0.5">
                        ID : {selected.user_id.slice(0, 18)}…
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {roles.map((r) => {
                          const cfg = ROLE_CONFIG[r];
                          if (!cfg) return null;
                          return (
                            <span key={r} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/15 text-white border border-white/20 font-body">
                              <cfg.icon className="w-2.5 h-2.5" /> {cfg.label}
                            </span>
                          );
                        })}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border font-body ${kycCfg.className}`}>
                          <KycIcon className="w-2.5 h-2.5" /> {kycCfg.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 space-y-0.5">

                  {/* Coordonnées */}
                  <DrawerSection title="Coordonnées" />
                  <FieldRow icon={Phone}   label="Téléphone"       value={selected.phone} />
                  <FieldRow icon={MapPin}  label="Adresse"         value={selected.address} />
                  <FieldRow icon={MapPin}  label="Code postal"     value={selected.postal_code} />
                  <FieldRow icon={MapPin}  label="Ville"           value={selected.city} />
                  <FieldRow icon={Globe}   label="Pays"            value={selected.country} />
                  {!selected.phone && !selected.address && !selected.city && (
                    <p className="font-body text-xs text-muted-foreground py-1">Aucune coordonnée renseignée</p>
                  )}

                  {/* Identité */}
                  <DrawerSection title="Identité" />
                  <FieldRow icon={Calendar} label="Date de naissance" value={selected.date_of_birth ? new Date(selected.date_of_birth).toLocaleDateString("fr-FR") : null} />
                  <FieldRow icon={Globe}    label="Nationalité"       value={selected.nationality} />
                  <FieldRow icon={Languages} label="Langues"          value={selected.languages?.length ? selected.languages.join(", ") : null} />
                  <FieldRow icon={User}     label="Bio"               value={selected.bio} />
                  <FieldRow icon={Calendar} label="Inscrit le"        value={new Date(selected.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })} />

                  {/* Certification KYC */}
                  <DrawerSection title="Certification hôte (KYC)" />
                  <div className="py-2 flex flex-wrap gap-2">
                    {(["en_cours", "validé", "refusé", "non_soumis"] as const).map((s) => {
                      const cfg = KYC_CFG[s];
                      const Icon = cfg.icon;
                      return (
                        <button
                          key={s}
                          disabled={isPending || selected.kyc_status === s}
                          onClick={() => kycMutation.mutate({ userId: selected.user_id, status: s })}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body font-semibold border transition-all disabled:opacity-50 ${
                            selected.kyc_status === s ? cfg.className + " ring-2 ring-current/20" : "text-muted-foreground bg-muted border-border hover:border-primary/30"
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Informations fiscales */}
                  <DrawerSection title="Informations fiscales" />
                  <FieldRow icon={FileText}  label="Type fiscal"       value={selected.fiscal_type} />
                  <FieldRow icon={Building2} label="Raison sociale"    value={selected.company_name} />
                  <FieldRow icon={Hash}      label="SIRET"             value={selected.siret} />
                  <FieldRow icon={Hash}      label="Numéro de TVA"     value={selected.vat_number} />
                  <FieldRow icon={MapPin}    label="Adresse de facturation" value={selected.billing_address} />
                  {!selected.fiscal_type && !selected.siret && !selected.vat_number && (
                    <p className="font-body text-xs text-muted-foreground py-1">Aucune information fiscale renseignée</p>
                  )}

                  {/* Paiement */}
                  <DrawerSection title="Paiement & Virement" />
                  <FieldRow icon={CreditCard} label="Méthode de paiement" value={selected.payout_method} />
                  <FieldRow icon={Banknote}   label="IBAN"               value={selected.iban ? `${selected.iban.slice(0, 4)} •••• •••• •••• ${selected.iban.slice(-4)}` : null} />
                  <FieldRow icon={Globe}      label="Devise"             value={selected.currency} />
                  {!selected.payout_method && !selected.iban && (
                    <p className="font-body text-xs text-muted-foreground py-1">Aucune information bancaire renseignée</p>
                  )}

                  {/* Réservations */}
                  <DrawerSection title={`Dernières réservations (${userBookings.length})`} />
                  {userBookings.length === 0 ? (
                    <p className="font-body text-xs text-muted-foreground py-1">Aucune réservation</p>
                  ) : (
                    <div className="space-y-2 pt-1">
                      {userBookings.map((b: any) => (
                        <div key={b.id} className="flex items-start justify-between gap-2 p-2 rounded-lg bg-muted/40 border border-border">
                          <div className="min-w-0">
                            <p className="font-body text-xs font-semibold text-foreground truncate">{b.property_title}</p>
                            <p className="font-body text-[11px] text-muted-foreground">
                              {new Date(b.check_in).toLocaleDateString("fr-FR")} → {new Date(b.check_out).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-body text-xs font-bold text-foreground">{b.total?.toLocaleString("fr-FR")} €</p>
                            <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full font-body ${
                              b.status === "confirmed" ? "bg-primary/10 text-primary" :
                              b.status === "cancelled" ? "bg-destructive/10 text-destructive" :
                              "bg-muted text-muted-foreground"
                            }`}>{b.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Annonces */}
                  {(rolesMap[selected.user_id] ?? []).includes("hote") && (
                    <>
                      <DrawerSection title={`Annonces hôte (${userProperties.length})`} />
                      {userProperties.length === 0 ? (
                        <p className="font-body text-xs text-muted-foreground py-1">Aucune annonce</p>
                      ) : (
                        <div className="space-y-2 pt-1">
                          {userProperties.map((pr: any) => (
                            <div key={pr.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/40 border border-border">
                              <div className="min-w-0">
                                <p className="font-body text-xs font-semibold text-foreground truncate">{pr.title}</p>
                                <p className="font-body text-[11px] text-muted-foreground">{pr.location}</p>
                              </div>
                              <div className="text-right shrink-0 space-y-0.5">
                                <p className="font-body text-xs font-bold text-foreground">{pr.price} €/nuit</p>
                                <div className="flex items-center gap-1 justify-end">
                                  <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                  <span className="font-body text-[10px] text-muted-foreground">{pr.rating} ({pr.reviews})</span>
                                  <span className={`inline-block text-[10px] font-semibold px-1.5 py-px rounded-full font-body ${pr.active ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                                    {pr.active ? "Actif" : "Inactif"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* Actions rapides */}
                  <DrawerSection title="Actions rapides" />
                  <div className="flex flex-wrap gap-2 pt-1 pb-6">
                    {!(rolesMap[selected.user_id] ?? []).includes("hote") ? (
                      <Button size="sm" variant="outline" className="font-body gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50"
                        onClick={() => addRoleMutation.mutate({ userId: selected.user_id, role: "hote" })} disabled={addRoleMutation.isPending}>
                        <UserCheck className="w-3.5 h-3.5" /> Attribuer rôle hôte
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="font-body gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => removeRoleMutation.mutate({ userId: selected.user_id, role: "hote" })} disabled={removeRoleMutation.isPending}>
                        <UserX className="w-3.5 h-3.5" /> Retirer rôle hôte
                      </Button>
                    )}
                    {!(rolesMap[selected.user_id] ?? []).includes("admin") ? (
                      <Button size="sm" variant="outline" className="font-body gap-1.5 border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => addRoleMutation.mutate({ userId: selected.user_id, role: "admin" })} disabled={addRoleMutation.isPending}>
                        <Shield className="w-3.5 h-3.5" /> Promouvoir admin
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="font-body gap-1.5 text-muted-foreground hover:bg-muted"
                        onClick={() => removeRoleMutation.mutate({ userId: selected.user_id, role: "admin" })} disabled={removeRoleMutation.isPending}>
                        <UserX className="w-3.5 h-3.5" /> Retirer admin
                      </Button>
                    )}

                    {/* Suspension */}
                    <Separator className="w-full my-1" />
                    {!selected.is_suspended ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="font-body gap-1.5 w-full"
                        onClick={() => openSuspendDialog(selected.user_id, true, `${selected.first_name ?? ""} ${selected.last_name ?? ""}`.trim())}
                        disabled={suspendMutation.isPending}
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Suspendre ce compte
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="font-body gap-1.5 w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                        onClick={() => openSuspendDialog(selected.user_id, false, `${selected.first_name ?? ""} ${selected.last_name ?? ""}`.trim())}
                        disabled={suspendMutation.isPending}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Réactiver ce compte
                      </Button>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* ── Suspend / Reactivate confirmation dialog ─────────────────────────── */}
      <AlertDialog open={!!suspendDialog} onOpenChange={(o) => { if (!o) { setSuspendDialog(null); setSuspendReason(""); } }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display flex items-center gap-2">
              {suspendDialog?.suspend
                ? <><Ban className="w-5 h-5 text-destructive" /> Suspendre le compte</>
                : <><RotateCcw className="w-5 h-5 text-emerald-600" /> Réactiver le compte</>
              }
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body text-sm">
              {suspendDialog?.suspend
                ? <>Vous allez suspendre le compte de <strong>{suspendDialog.name || "cet utilisateur"}</strong>. Un email de notification lui sera envoyé automatiquement.</>
                : <>Vous allez réactiver le compte de <strong>{suspendDialog?.name || "cet utilisateur"}</strong>. Un email de confirmation lui sera envoyé.</>
              }
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-2">
            <label className="font-body text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
              Motif de la décision
              <span className="font-normal text-muted-foreground">(optionnel)</span>
            </label>
            <Textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder={suspendDialog?.suspend
                ? "Ex : Comportement inapproprié détecté, non-respect des CGU…"
                : "Ex : Dossier vérifié, compte régularisé…"
              }
              className="font-body text-sm resize-none h-24"
            />
            <p className="font-body text-xs text-muted-foreground mt-1.5">
              Ce motif sera inclus dans l'email envoyé à l'utilisateur.
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="font-body" onClick={() => { setSuspendDialog(null); setSuspendReason(""); }}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              className={`font-body ${suspendDialog?.suspend ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
              onClick={() => {
                if (!suspendDialog) return;
                suspendMutation.mutate({
                  userId: suspendDialog.userId,
                  suspend: suspendDialog.suspend,
                  reason: suspendReason.trim() || undefined,
                });
              }}
              disabled={suspendMutation.isPending}
            >
              {suspendMutation.isPending
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> En cours…</>
                : suspendDialog?.suspend ? "Confirmer la suspension" : "Confirmer la réactivation"
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

