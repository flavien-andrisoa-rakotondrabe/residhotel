import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface FavoriteProperty {
  id: string;
  property_id: string;
  property_title: string;
  property_image: string | null;
  property_location: string | null;
  property_price: number;
  property_rating: number;
  property_type: string | null;
  created_at: string;
}

export function useFavorites() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as FavoriteProperty[];
    },
  });

  const favoriteIds = new Set(favorites.map((f) => f.property_id));

  const toggleMutation = useMutation({
    mutationFn: async (params: {
      propertyId: string;
      propertyTitle: string;
      propertyImage?: string | null;
      propertyLocation?: string | null;
      propertyPrice?: number;
      propertyRating?: number;
      propertyType?: string | null;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const isFav = favoriteIds.has(params.propertyId);

      if (isFav) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("property_id", params.propertyId);
        if (error) throw error;
        return false;
      } else {
        const { error } = await supabase.from("favorites").insert({
          user_id: user.id,
          property_id: params.propertyId,
          property_title: params.propertyTitle,
          property_image: params.propertyImage ?? null,
          property_location: params.propertyLocation ?? null,
          property_price: params.propertyPrice ?? 0,
          property_rating: params.propertyRating ?? 0,
          property_type: params.propertyType ?? null,
        });
        if (error) throw error;
        return true;
      }
    },
    onSuccess: (added) => {
      qc.invalidateQueries({ queryKey: ["favorites", user?.id] });
      toast({
        title: added ? "Ajouté aux favoris ❤️" : "Retiré des favoris",
        description: added
          ? "Ce bien a été sauvegardé dans vos favoris."
          : "Ce bien a été retiré de vos favoris.",
      });
    },
    onError: (e: Error) => {
      if (e.message === "Not authenticated") {
        toast({ title: "Connectez-vous pour sauvegarder des biens.", variant: "destructive" });
      } else {
        toast({ title: "Erreur", description: e.message, variant: "destructive" });
      }
    },
  });

  const isFavorite = (propertyId: string) => favoriteIds.has(propertyId);

  const toggle = (params: Parameters<typeof toggleMutation.mutate>[0]) =>
    toggleMutation.mutate(params);

  return {
    favorites,
    isLoading,
    isFavorite,
    toggle,
    isPending: toggleMutation.isPending,
  };
}
