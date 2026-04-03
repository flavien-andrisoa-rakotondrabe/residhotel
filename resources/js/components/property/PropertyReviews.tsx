import { useQuery } from "@tanstack/react-query";
import { Star, UserCircle2, Quote } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface DBReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_id: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface Props { propertyId?: string; }

function initials(fn: string | null, ln: string | null) {
  return ((fn?.[0]?.toUpperCase() ?? "") + (ln?.[0]?.toUpperCase() ?? "")) || "?";
}

function ratingLabel(avg: number) {
  if (avg >= 4.8) return "Exceptionnel";
  if (avg >= 4.5) return "Remarquable";
  if (avg >= 4.0) return "Très bien";
  if (avg >= 3.5) return "Bien";
  return "Correct";
}

function StarRow({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "w-3.5 h-3.5",
            i < value ? "fill-accent text-accent" : "fill-muted/50 text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

export default function PropertyReviews({ propertyId }: Props) {
  const isUUID = propertyId && /^[0-9a-f-]{36}$/i.test(propertyId);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["property-reviews", propertyId],
    enabled: !!isUUID,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, reviewer_id")
        .eq("property_id", propertyId!)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const reviewerIds = [...new Set((data ?? []).map((r: { reviewer_id: string }) => r.reviewer_id))];
      let profileMap: Record<string, { first_name: string | null; last_name: string | null; avatar_url: string | null }> = {};
      if (reviewerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name, avatar_url")
          .in("user_id", reviewerIds);
        (profiles ?? []).forEach((p) => { profileMap[p.user_id] = p; });
      }

      return (data ?? []).map((r: { id: string; rating: number; comment: string | null; created_at: string; reviewer_id: string }) => ({
        ...r,
        profiles: profileMap[r.reviewer_id] ?? null,
      })) as DBReview[];
    },
  });

  const count = reviews.length;
  const avg = count > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;

  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const n = reviews.filter((r) => r.rating === star).length;
    return { star, count: n, pct: count > 0 ? Math.round((n / count) * 100) : 0 };
  });

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="flex gap-6">
          <Skeleton className="h-28 w-28 rounded-2xl" />
          <div className="flex-1 space-y-2 pt-1">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-4 rounded-full" />)}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      </section>
    );
  }

  if (!isUUID || count === 0) {
    return (
      <section>
        <div className="flex flex-col items-center justify-center py-10 text-center bg-muted/30 rounded-2xl border border-border">
          <div className="flex mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-muted/40 text-muted-foreground/30" />
            ))}
          </div>
          <p className="font-body text-sm text-muted-foreground italic max-w-xs">
            Aucun avis pour le moment. Soyez le premier à laisser un commentaire après votre séjour !
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      {/* Summary hero */}
      <div className="flex flex-col sm:flex-row items-start gap-6 p-6 bg-muted/30 rounded-2xl border border-border">
        {/* Score */}
        <div className="flex flex-col items-center justify-center bg-card rounded-2xl border border-border px-8 py-5 shadow-card shrink-0 min-w-[120px]">
          <span className="font-display text-5xl font-bold text-foreground leading-none">{avg.toFixed(1)}</span>
          <div className="flex mt-2 mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={cn("w-4 h-4", i < Math.round(avg) ? "fill-accent text-accent" : "fill-muted/50 text-muted-foreground/30")} />
            ))}
          </div>
          <p className="font-body text-xs font-semibold text-primary text-center">{ratingLabel(avg)}</p>
          <p className="font-body text-xs text-muted-foreground mt-0.5">{count} avis</p>
        </div>

        {/* Breakdown bars */}
        <div className="flex-1 w-full space-y-2.5">
          {breakdown.map(({ star, count: n, pct }) => (
            <div key={star} className="flex items-center gap-3">
              <div className="flex items-center gap-0.5 w-[72px] shrink-0 justify-end">
                {Array.from({ length: star }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                ))}
              </div>
              <div className="flex-1 relative">
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <span className="font-body text-xs text-muted-foreground w-6 text-right">{n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Individual reviews grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((r) => {
          const profile = r.profiles;
          const fn = profile?.first_name ?? null;
          const ln = profile?.last_name ?? null;
          const fullName = [fn, ln].filter(Boolean).join(" ") || "Voyageur";
          const ini = initials(fn, ln);

          return (
            <div
              key={r.id}
              className="bg-card rounded-2xl p-5 border border-border shadow-card hover:border-primary/20 hover:shadow-hero transition-all space-y-4 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-brand flex items-center justify-center">
                      {ini !== "?" ? (
                        <span className="font-display text-primary-foreground font-bold text-sm">{ini}</span>
                      ) : (
                        <UserCircle2 className="w-5 h-5 text-primary-foreground" />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-foreground text-sm truncate">{fullName}</p>
                  <p className="font-body text-muted-foreground text-xs capitalize">
                    {format(parseISO(r.created_at), "MMMM yyyy", { locale: fr })}
                  </p>
                </div>
                <StarRow value={r.rating} />
              </div>

              {/* Rating badge */}
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-body font-bold",
                  r.rating >= 4 ? "bg-primary/8 text-primary" : r.rating >= 3 ? "bg-accent/15 text-accent" : "bg-destructive/10 text-destructive"
                )}>
                  <Star className="w-3 h-3 fill-current" />
                  {r.rating}/5 — {ratingLabel(r.rating)}
                </div>
              </div>

              {/* Comment */}
              <div className="flex-1 relative">
                {r.comment ? (
                  <>
                    <Quote className="w-5 h-5 text-muted-foreground/20 absolute -top-1 -left-1" />
                    <p className="font-body text-muted-foreground text-sm leading-relaxed pl-3">
                      {r.comment}
                    </p>
                  </>
                ) : (
                  <p className="font-body text-muted-foreground/50 text-sm italic">Sans commentaire écrit.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
