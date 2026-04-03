import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Star, Loader2, CheckCircle2, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Props {
  bookingId: string;
  propertyId: string;
  propertyTitle: string;
  onDone?: () => void;
}

export default function ReviewForm({ bookingId, propertyId, propertyTitle, onDone }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [open, setOpen] = useState(false);

  // Check if a review already exists for this booking
  const { data: existing, isLoading: checkLoading } = useQuery({
    queryKey: ["review-exists", bookingId],
    enabled: !!bookingId && !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id, rating, comment")
        .eq("booking_id", bookingId)
        .maybeSingle();
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Connexion requise");
      if (rating < 1) throw new Error("Veuillez sélectionner une note.");
      const { error } = await supabase.from("reviews").insert({
        booking_id: bookingId,
        property_id: propertyId,
        reviewer_id: user.id,
        rating,
        comment: comment.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["review-exists", bookingId] });
      qc.invalidateQueries({ queryKey: ["property-reviews", propertyId] });
      qc.invalidateQueries({ queryKey: ["property", propertyId] });
      qc.invalidateQueries({ queryKey: ["properties"] });
      toast({ title: "Avis publié !", description: "Merci pour votre retour." });
      setOpen(false);
      onDone?.();
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  if (checkLoading) return null;

  // Already reviewed
  if (existing) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="font-body text-xs text-primary font-medium">Avis publié</span>
        <div className="flex items-center gap-0.5 ml-1">
          {Array.from({ length: existing.rating }).map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-accent text-accent" />
          ))}
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="font-body text-xs h-8 gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
        onClick={() => setOpen(true)}
      >
        <PenLine className="w-3.5 h-3.5" />
        Laisser un avis
      </Button>
    );
  }

  const displayRating = hovered || rating;
  const LABELS = ["", "Décevant", "Passable", "Bien", "Très bien", "Exceptionnel"];

  return (
    <div className="mt-3 bg-secondary/30 rounded-xl border border-border p-4 space-y-3 animate-fade-in">
      <p className="font-body text-sm font-semibold text-foreground">
        Votre avis sur <span className="text-primary">{propertyTitle}</span>
      </p>

      {/* Star picker */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "w-7 h-7 transition-colors",
                  s <= displayRating
                    ? "fill-accent text-accent"
                    : "fill-muted text-muted-foreground/40"
                )}
              />
            </button>
          ))}
          {displayRating > 0 && (
            <span className="font-body text-sm font-semibold text-foreground ml-2">
              {LABELS[displayRating]}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <Textarea
        placeholder="Décrivez votre expérience (optionnel)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="font-body text-sm resize-none"
      />

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="font-body text-xs"
          onClick={() => setOpen(false)}
        >
          Annuler
        </Button>
        <Button
          size="sm"
          onClick={() => mutation.mutate()}
          disabled={rating < 1 || mutation.isPending}
          className="bg-gradient-brand text-primary-foreground hover:opacity-90 font-body text-xs gap-1.5"
        >
          {mutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Publier l'avis
        </Button>
      </div>
    </div>
  );
}
