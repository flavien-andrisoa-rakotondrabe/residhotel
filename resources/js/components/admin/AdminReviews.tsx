import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Search, Star, Trash2, Loader2, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, MessageSquare, AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// ── Types ──────────────────────────────────────────────────────────────────
interface Review {
  id: string;
  property_id: string;
  reviewer_id: string;
  booking_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  // joined
  property_title?: string;
  property_location?: string;
  reviewer_first?: string;
  reviewer_last?: string;
  reviewer_avatar?: string | null;
}

interface RankedProperty {
  id: string;
  title: string;
  location: string;
  rating: number;
  reviews: number;
  image: string | null;
}

const PAGE_SIZE = 10;

// ── Star display ──────────────────────────────────────────────────────────
function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const s = size === "lg" ? "w-4 h-4" : "w-3 h-3";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${s} ${i <= rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

const RATING_COLOR: Record<number, string> = {
  5: "text-primary bg-primary/10 border-primary/20",
  4: "text-primary/80 bg-primary/8 border-primary/15",
  3: "text-accent bg-accent/10 border-accent/20",
  2: "text-accent bg-accent/15 border-accent/25",
  1: "text-destructive bg-destructive/10 border-destructive/20",
};

// ── Component ─────────────────────────────────────────────────────────────
export default function AdminReviews() {
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const { toast } = useToast();

  // ── Fetch all reviews, join properties + profiles client-side ──────────
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const [{ data: rawReviews, error: rErr }, { data: properties }, { data: profiles }] =
        await Promise.all([
          supabase
            .from("reviews")
            .select("id,property_id,reviewer_id,booking_id,rating,comment,created_at")
            .order("created_at", { ascending: false }),
          supabase.from("properties").select("id,title,location"),
          supabase.from("profiles").select("user_id,first_name,last_name,avatar_url"),
        ]);

      if (rErr) throw rErr;

      const propMap = Object.fromEntries((properties ?? []).map((p) => [p.id, p]));
      const profMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p]));

      return (rawReviews ?? []).map((r): Review => ({
        ...r,
        property_title: propMap[r.property_id]?.title ?? "Propriété inconnue",
        property_location: propMap[r.property_id]?.location ?? "",
        reviewer_first: profMap[r.reviewer_id]?.first_name ?? null,
        reviewer_last: profMap[r.reviewer_id]?.last_name ?? null,
        reviewer_avatar: profMap[r.reviewer_id]?.avatar_url ?? null,
      }));
    },
  });

  // ── Best / worst rated properties ──────────────────────────────────────
  const { data: rankedProperties = [] } = useQuery({
    queryKey: ["admin-ranked-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id,title,location,rating,reviews,image")
        .gt("reviews", 0)
        .order("rating", { ascending: false });
      if (error) throw error;
      return data as RankedProperty[];
    },
  });

  const topProperties    = rankedProperties.slice(0, 5);
  const bottomProperties = [...rankedProperties].sort((a, b) => a.rating - b.rating).slice(0, 5);

  // ── Delete ─────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      qc.invalidateQueries({ queryKey: ["admin-ranked-properties"] });
      toast({ title: "Avis supprimé" });
    },
    onError: () => toast({ title: "Erreur lors de la suppression", variant: "destructive" }),
  });

  // ── Filtering ──────────────────────────────────────────────────────────
  const filtered = reviews.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      (r.property_title ?? "").toLowerCase().includes(q) ||
      (r.comment ?? "").toLowerCase().includes(q) ||
      `${r.reviewer_first ?? ""} ${r.reviewer_last ?? ""}`.toLowerCase().includes(q);
    const matchRating = ratingFilter === "all" || r.rating === ratingFilter;
    return matchSearch && matchRating;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Rating distribution ────────────────────────────────────────────────
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0,
  }));
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="space-y-8">

      {/* ── Summary row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total + avg */}
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="font-body text-xs text-muted-foreground uppercase tracking-wide font-semibold">Total avis</p>
            <p className="font-display text-2xl font-bold text-foreground">{reviews.length}</p>
            {avgRating > 0 && (
              <div className="flex items-center gap-1.5 mt-1">
                <Stars rating={Math.round(avgRating)} />
                <span className="font-body text-xs font-semibold text-muted-foreground">{avgRating.toFixed(2)} / 5</span>
              </div>
            )}
          </div>
        </div>

        {/* Distribution */}
        <div className="bg-card border border-border rounded-2xl p-5 sm:col-span-2">
          <p className="font-body text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-3">Répartition des notes</p>
          <div className="space-y-1.5">
            {distribution.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-2">
                <button
                  onClick={() => { setRatingFilter(ratingFilter === star ? "all" : star); setPage(1); }}
                  className={`flex items-center gap-1 w-16 shrink-0 transition-opacity ${ratingFilter !== "all" && ratingFilter !== star ? "opacity-40" : ""}`}
                >
                  <Star className="w-3 h-3 fill-accent text-accent" />
                  <span className="font-body text-xs font-semibold">{star}</span>
                  <span className="font-body text-[10px] text-muted-foreground ml-auto">({count})</span>
                </button>
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="font-body text-[10px] text-muted-foreground w-8 text-right">{pct.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Best / Worst properties ── */}
      {rankedProperties.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Best */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="font-display font-semibold text-foreground">Meilleures propriétés</h3>
            </div>
            <div className="divide-y divide-border">
              {topProperties.map((p, i) => (
                <div key={p.id} className="px-5 py-3 flex items-center gap-3 hover:bg-muted/20 transition-colors">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-display text-xs font-bold shrink-0 ${
                    i === 0 ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                  }`}>
                    {i + 1}
                  </span>
                  {p.image && (
                    <img src={p.image} alt="" className="w-10 h-9 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium text-foreground line-clamp-1">{p.title}</p>
                    <p className="font-body text-xs text-muted-foreground">{p.location}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                    <span className="font-body text-sm font-bold text-foreground">{Number(p.rating).toFixed(1)}</span>
                    <span className="font-body text-xs text-muted-foreground">({p.reviews})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Worst */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-destructive" />
              <h3 className="font-display font-semibold text-foreground">Propriétés à surveiller</h3>
            </div>
            <div className="divide-y divide-border">
              {bottomProperties.map((p, i) => (
                <div key={p.id} className="px-5 py-3 flex items-center gap-3 hover:bg-muted/20 transition-colors">
                  <span className="w-6 h-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center font-display text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  {p.image && (
                    <img src={p.image} alt="" className="w-10 h-9 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium text-foreground line-clamp-1">{p.title}</p>
                    <p className="font-body text-xs text-muted-foreground">{p.location}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className={`w-3.5 h-3.5 ${Number(p.rating) < 3 ? "fill-destructive text-destructive" : "fill-accent text-accent"}`} />
                    <span className="font-body text-sm font-bold text-foreground">{Number(p.rating).toFixed(1)}</span>
                    <span className="font-body text-xs text-muted-foreground">({p.reviews})</span>
                  </div>
                </div>
              ))}
              {bottomProperties.length === 0 && (
                <div className="px-5 py-8 text-center font-body text-sm text-muted-foreground">Aucune propriété notée</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher un avis, propriété, auteur…"
            className="pl-9 font-body"
          />
        </div>

        <div className="flex gap-1 bg-muted rounded-xl p-1">
          <button
            onClick={() => { setRatingFilter("all"); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg font-body text-xs font-semibold transition-all ${
              ratingFilter === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Tous
          </button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              onClick={() => { setRatingFilter(ratingFilter === s ? "all" : s); setPage(1); }}
              className={`px-2.5 py-1.5 rounded-lg font-body text-xs font-semibold transition-all flex items-center gap-1 ${
                ratingFilter === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Star className="w-3 h-3 fill-accent text-accent" /> {s}
            </button>
          ))}
        </div>

        <p className="font-body text-sm text-muted-foreground">
          {filtered.length} avis
        </p>
      </div>

      {/* ── Reviews table ── */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                {["Auteur", "Propriété", "Note", "Commentaire", "Date", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr><td colSpan={6} className="px-4 py-10 text-center">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                </td></tr>
              )}
              {!isLoading && paginated.map((r) => {
                const authorName = [r.reviewer_first, r.reviewer_last].filter(Boolean).join(" ") || "Anonyme";
                const initials   = `${r.reviewer_first?.[0] ?? ""}${r.reviewer_last?.[0] ?? ""}`.toUpperCase() || "?";

                return (
                  <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                    {/* Author */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                          {r.reviewer_avatar
                            ? <img src={r.reviewer_avatar} alt={initials} className="w-full h-full object-cover" />
                            : <span className="font-display text-primary font-bold text-[10px]">{initials}</span>
                          }
                        </div>
                        <p className="font-body text-sm font-medium text-foreground whitespace-nowrap">{authorName}</p>
                      </div>
                    </td>

                    {/* Property */}
                    <td className="px-4 py-3 max-w-[180px]">
                      <p className="font-body text-sm text-foreground line-clamp-1">{r.property_title}</p>
                      <p className="font-body text-xs text-muted-foreground line-clamp-1">{r.property_location}</p>
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold font-body border ${RATING_COLOR[r.rating] ?? ""}`}>
                        <Star className="w-2.5 h-2.5 fill-current" />
                        {r.rating}/5
                      </span>
                    </td>

                    {/* Comment */}
                    <td className="px-4 py-3 max-w-[260px]">
                      {r.comment ? (
                        <p className="font-body text-sm text-foreground line-clamp-2">{r.comment}</p>
                      ) : (
                        <span className="font-body text-xs text-muted-foreground italic">Aucun commentaire</span>
                      )}
                      {r.rating <= 2 && r.comment && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-body text-accent mt-1">
                          <AlertTriangle className="w-2.5 h-2.5" /> Note faible
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-body text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm("Supprimer cet avis définitivement ?")) {
                            deleteMutation.mutate(r.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && paginated.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center font-body text-muted-foreground">
                  Aucun avis trouvé
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between gap-3">
            <p className="font-body text-xs text-muted-foreground">
              {filtered.length} avis · Page {page} / {totalPages}
            </p>
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
    </div>
  );
}
