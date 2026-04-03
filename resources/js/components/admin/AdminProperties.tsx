import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Search, Eye, EyeOff, Star, MapPin, Loader2,
  ChevronLeft, ChevronRight, Trash2, ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Property {
  id: string;
  title: string;
  location: string;
  type: string;
  price: number;
  rating: number;
  reviews: number;
  active: boolean;
  host_id: string;
  created_at: string;
  image: string | null;
  images: string[];
  badge: string | null;
}

const PAGE_SIZE = 10;
const FALLBACK = "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=120";

export default function AdminProperties() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id,title,location,type,price,rating,reviews,active,host_id,created_at,image,images,badge")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Property[];
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("properties").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-properties"] });
      toast({ title: vars.active ? "Annonce activée" : "Annonce désactivée" });
    },
    onError: () => toast({ title: "Erreur", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-properties"] }); toast({ title: "Propriété supprimée" }); },
    onError: () => toast({ title: "Erreur lors de la suppression", variant: "destructive" }),
  });

  const filtered = properties.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "active" ? p.active : !p.active);
    return matchSearch && matchFilter;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher une propriété…"
            className="pl-9 font-body"
          />
        </div>
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg font-body text-xs font-semibold transition-all ${
                filter === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "Tout" : f === "active" ? "Actifs" : "Inactifs"}
            </button>
          ))}
        </div>
        <p className="font-body text-sm text-muted-foreground">{total} résultat{total > 1 ? "s" : ""}</p>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                {["Propriété", "Type", "Prix / nuit", "Note", "Statut", "Ajoutée le", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr><td colSpan={7} className="px-4 py-10 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></td></tr>
              )}
              {!isLoading && paginated.map((p) => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  {/* Property */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images?.[0] ?? p.image ?? FALLBACK}
                        alt={p.title}
                        className="w-12 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-body font-medium text-foreground line-clamp-1">{p.title}</p>
                        <p className="font-body text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />
                          {p.location}
                        </p>
                      </div>
                    </div>
                  </td>
                  {/* Type */}
                  <td className="px-4 py-3">
                    <span className="font-body text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{p.type}</span>
                  </td>
                  {/* Price */}
                  <td className="px-4 py-3 font-display font-bold text-primary whitespace-nowrap">
                    {Number(p.price).toLocaleString("fr-FR")} €
                  </td>
                  {/* Rating */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                      <span className="font-body text-sm font-semibold">{Number(p.rating).toFixed(1)}</span>
                      <span className="font-body text-xs text-muted-foreground">({p.reviews})</span>
                    </div>
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`font-body text-xs font-semibold px-2 py-0.5 rounded-full ${
                      p.active ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                    }`}>
                      {p.active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  {/* Date */}
                  <td className="px-4 py-3 font-body text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(p.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link to={`/property/${p.id}`} target="_blank">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`h-7 w-7 p-0 ${p.active ? "text-accent hover:bg-accent/10" : "text-primary hover:bg-primary/10"}`}
                        onClick={() => toggleActiveMutation.mutate({ id: p.id, active: !p.active })}
                        disabled={toggleActiveMutation.isPending}
                      >
                        {p.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm(`Supprimer "${p.title}" ?`)) deleteMutation.mutate(p.id);
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && paginated.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center font-body text-muted-foreground">Aucune propriété</td></tr>
              )}
            </tbody>
          </table>
        </div>

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
    </div>
  );
}
