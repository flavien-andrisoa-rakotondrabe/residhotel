import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Edit, Trash2, Plus, ToggleLeft, ToggleRight,
  Star, MapPin, BedDouble, Users, TrendingUp, Loader2, Image as ImageIcon,
  CalendarDays, Images,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CreateListingWizard from "./CreateListingWizard";
import AvailabilityManager from "./AvailabilityManager";
import ListingImageManager from "./ListingImageManager";

// ── Types ─────────────────────────────────────────────────────────────────────
interface DBProperty {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  location: string;
  address: string | null;
  postal_code: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  price: number;
  type: string;
  rental_type: string;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  guests: number;
  surface: number | null;
  amenities: string[];
  images: string[];
  image: string | null;
  badge: string | null;
  rating: number;
  reviews: number;
  active: boolean;
  status: string;
  cleaning_fee: number;
  security_deposit: number;
  cancellation: string;
  instant_book: boolean;
  min_stay: number;
  created_at: string;
  updated_at: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function DashboardListings() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<DBProperty> | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [availabilityListing, setAvailabilityListing] = useState<{ id: string; title: string } | null>(null);
  const [photoListing, setPhotoListing] = useState<DBProperty | null>(null);

  // ── Query ──────────────────────────────────────────────────────────────────
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["host-properties", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("host_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DBProperty[];
    },
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("properties")
        .update({ active })
        .eq("id", id)
        .eq("host_id", user!.id);
      if (error) throw error;
    },
    onSuccess: (_, { active }) => {
      qc.invalidateQueries({ queryKey: ["host-properties"] });
      qc.invalidateQueries({ queryKey: ["properties"] });
      toast({ title: active ? "Annonce activée" : "Annonce désactivée" });
    },
    onError: (err: Error) => toast({ title: "Erreur", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", id)
        .eq("host_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["host-properties"] });
      qc.invalidateQueries({ queryKey: ["properties"] });
      setDeleteId(null);
      toast({ title: "Annonce supprimée", variant: "destructive" });
    },
    onError: (err: Error) => toast({ title: "Erreur", description: err.message, variant: "destructive" }),
  });

  const openNew = () => {
    setEditData(undefined);
    setWizardOpen(true);
  };

  const openEdit = (p: DBProperty) => {
    setEditData(p);
    setWizardOpen(true);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Mes annonces</h2>
          <p className="font-body text-muted-foreground text-sm mt-0.5">
            {isLoading ? "Chargement..." : `${listings.length} propriété${listings.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button
          onClick={openNew}
          className="bg-gradient-brand text-primary-foreground hover:opacity-90 font-body font-semibold gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle annonce
        </Button>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-5 animate-pulse flex gap-4">
              <div className="w-48 h-32 rounded-xl bg-muted shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && listings.length === 0 && (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Aucune annonce publiée</h3>
          <p className="font-body text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
            Publiez votre premier bien pour commencer à recevoir des voyageurs.
          </p>
          <Button
            onClick={openNew}
            className="bg-gradient-brand text-primary-foreground font-body font-semibold gap-2"
          >
            <Plus className="w-4 h-4" /> Publier mon premier bien
          </Button>
        </div>
      )}

      {/* Listings */}
      {!isLoading && listings.length > 0 && (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className={`bg-card rounded-2xl border shadow-card overflow-hidden transition-all ${
                listing.active ? "border-border" : "border-border opacity-70"
              }`}
            >
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="relative w-full md:w-52 h-40 md:h-auto shrink-0 bg-muted">
                  {(listing.image || listing.images?.[0]) ? (
                    <img
                      src={listing.image ?? listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                      <button
                        onClick={() => setPhotoListing(listing)}
                        className="font-body text-xs text-primary hover:underline"
                      >
                        + Ajouter des photos
                      </button>
                    </div>
                  )}
                  {listing.images && listing.images.length > 1 && (
                    <div className="absolute bottom-2 right-2">
                      <Badge variant="secondary" className="font-body text-[10px] gap-1 py-0.5 bg-black/60 text-white border-0">
                        <ImageIcon className="w-3 h-3" /> {listing.images.length}
                      </Badge>
                    </div>
                  )}
                  {!listing.active && (
                    <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
                      <Badge className="bg-background text-muted-foreground font-body text-xs">Désactivée</Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col justify-between gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant="outline" className="font-body text-xs">{listing.type}</Badge>
                        {listing.status === "draft" ? (
                          <Badge className="bg-accent/20 text-accent-foreground font-body text-xs border-0">Brouillon</Badge>
                        ) : listing.active ? (
                          <Badge className="bg-primary/15 text-primary font-body text-xs border-0">En ligne</Badge>
                        ) : (
                          <Badge className="bg-muted text-muted-foreground font-body text-xs border-0">Hors ligne</Badge>
                        )}
                        {listing.badge && (
                          <Badge className="bg-accent/20 text-accent-foreground font-body text-xs border-0">{listing.badge}</Badge>
                        )}
                      </div>
                      <h3 className="font-display text-lg font-bold text-foreground leading-snug">{listing.title}</h3>
                      <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="font-body text-xs">{listing.location}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-display text-2xl font-bold text-primary">{Number(listing.price).toLocaleString("fr-FR")}€</span>
                      <span className="font-body text-xs text-muted-foreground"> / nuit</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-5">
                    {listing.rating > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-accent" />
                        <span className="font-body text-xs text-accent">{listing.rating} ({listing.reviews} avis)</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <BedDouble className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-body text-xs text-muted-foreground">{listing.bedrooms} chambre{listing.bedrooms > 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-body text-xs text-muted-foreground">{listing.guests} voyageurs</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-primary" />
                      <span className="font-body text-xs text-primary">{listing.reviews} réservation{listing.reviews !== 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  {/* Amenities preview */}
                  {listing.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {listing.amenities.slice(0, 4).map((a) => (
                        <Badge key={a} variant="outline" className="font-body text-xs">{a}</Badge>
                      ))}
                      {listing.amenities.length > 4 && (
                        <Badge variant="outline" className="font-body text-xs">+{listing.amenities.length - 4}</Badge>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-border flex-wrap">
                    <Button
                      variant="ghost" size="sm"
                      className="font-body text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(listing)}
                    >
                      <Edit className="w-3.5 h-3.5" /> Modifier
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      className="font-body text-xs gap-1.5 text-muted-foreground hover:text-primary"
                      onClick={() => setPhotoListing(listing)}
                    >
                      <Images className="w-3.5 h-3.5" /> Photos
                      {(!listing.images || listing.images.length === 0) && (
                        <Badge className="bg-accent/20 text-accent-foreground border-0 font-body text-[10px] px-1 h-4 ml-1">0</Badge>
                      )}
                      {listing.images && listing.images.length > 0 && (
                        <Badge variant="secondary" className="font-body text-[10px] px-1 h-4 ml-1">{listing.images.length}</Badge>
                      )}
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      className="font-body text-xs gap-1.5 text-muted-foreground hover:text-primary"
                      onClick={() => setAvailabilityListing({ id: listing.id, title: listing.title })}
                    >
                      <CalendarDays className="w-3.5 h-3.5" /> Disponibilités
                    </Button>
                    <button
                      onClick={() => toggleMutation.mutate({ id: listing.id, active: !listing.active })}
                      disabled={toggleMutation.isPending}
                      className="flex items-center gap-1.5 ml-auto font-body text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted/50"
                    >
                      {listing.active
                        ? <><ToggleRight className="w-4 h-4 text-primary" /> Désactiver</>
                        : <><ToggleLeft className="w-4 h-4" /> Activer</>
                      }
                    </button>
                    <button
                      onClick={() => setDeleteId(listing.id)}
                      className="flex items-center gap-1 font-body text-xs text-destructive/70 hover:text-destructive transition-colors px-2 py-1 rounded-lg hover:bg-destructive/5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Full-screen Wizard ── */}
      {wizardOpen && (
        <CreateListingWizard
          onClose={() => { setWizardOpen(false); setEditData(undefined); }}
          editData={editData ? { ...editData } : undefined}
        />
      )}

      {/* ── Availability Manager Dialog ── */}
      <Dialog open={!!availabilityListing} onOpenChange={() => setAvailabilityListing(null)}>
        <DialogContent className="max-w-2xl font-body max-h-[90vh] overflow-y-auto">
          {availabilityListing && (
            <AvailabilityManager
              propertyId={availabilityListing.id}
              propertyTitle={availabilityListing.title}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Photo Manager Dialog ── */}
      <Dialog open={!!photoListing} onOpenChange={() => setPhotoListing(null)}>
        <DialogContent className="max-w-3xl font-body max-h-[90vh] overflow-y-auto">
          {photoListing && (
            <ListingImageManager
              propertyId={photoListing.id}
              propertyTitle={photoListing.title}
              initialImages={photoListing.images ?? []}
              initialMainImage={photoListing.image}
              onClose={() => setPhotoListing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm ── */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="font-body">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-destructive">Supprimer l'annonce ?</DialogTitle>
          </DialogHeader>
          <p className="font-body text-muted-foreground text-sm">
            Cette action est irréversible. L'annonce sera définitivement supprimée.
          </p>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="font-body">Annuler</Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="font-body font-semibold gap-2"
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
