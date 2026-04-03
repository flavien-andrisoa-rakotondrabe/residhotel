import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Images, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import ImageUploadZone from "./ImageUploadZone";

interface Props {
  propertyId: string;
  propertyTitle: string;
  initialImages: string[];
  initialMainImage: string | null;
  onClose: () => void;
}

export default function ListingImageManager({
  propertyId,
  propertyTitle,
  initialImages,
  initialMainImage,
  onClose,
}: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [images, setImages] = useState<string[]>(initialImages);
  const [mainImage, setMainImage] = useState<string>(initialMainImage ?? initialImages[0] ?? "");

  const handleChange = (nextImages: string[], nextMain: string) => {
    setImages(nextImages);
    setMainImage(nextMain);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("properties")
        .update({
          images,
          image: mainImage || images[0] || null,
        })
        .eq("id", propertyId)
        .eq("host_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["host-properties"] });
      qc.invalidateQueries({ queryKey: ["properties"] });
      qc.invalidateQueries({ queryKey: ["property", propertyId] });
      toast({ title: "Photos mises à jour ✓" });
      onClose();
    },
    onError: (e: Error) => {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    },
  });

  return (
    <>
      <DialogHeader className="pb-2">
        <DialogTitle className="font-display flex items-center gap-2">
          <Images className="w-5 h-5 text-primary" />
          Photos — {propertyTitle}
        </DialogTitle>
        <p className="font-body text-xs text-muted-foreground mt-1">
          Glissez-déposez vos photos ou cliquez pour parcourir. La première photo sera la photo principale sur les résultats de recherche.
        </p>
      </DialogHeader>

      <div className="py-4">
        <ImageUploadZone
          images={images}
          mainImage={mainImage}
          onChange={handleChange}
          propertyId={propertyId}
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} className="font-body">
          Annuler
        </Button>
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="bg-gradient-brand text-primary-foreground hover:opacity-90 font-body font-semibold gap-2"
        >
          {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Enregistrer les photos
        </Button>
      </DialogFooter>
    </>
  );
}
