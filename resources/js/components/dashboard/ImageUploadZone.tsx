import { useCallback, useRef, useState, DragEvent } from "react";
import { Upload, X, Star, Loader2, Image as ImageIcon, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const MAX_SIZE_MB = 5;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface Props {
  images: string[];           // current image URLs
  mainImage?: string;         // highlighted as cover
  onChange: (images: string[], mainImage: string) => void;
  propertyId?: string;        // used in storage path for organisation
  disabled?: boolean;
}

export default function ImageUploadZone({
  images,
  mainImage,
  onChange,
  propertyId,
  disabled,
}: Props) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Upload a batch of File objects ────────────────────────────
  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!user || files.length === 0) return;

      // Validate
      const valid = files.filter((f) => {
        if (!ACCEPTED.includes(f.type)) {
          toast({ title: `Type non supporté : ${f.name}`, variant: "destructive" });
          return false;
        }
        if (f.size > MAX_SIZE_MB * 1024 * 1024) {
          toast({ title: `${f.name} dépasse ${MAX_SIZE_MB} MB`, variant: "destructive" });
          return false;
        }
        return true;
      });
      if (valid.length === 0) return;

      setUploading(true);
      const uploaded: string[] = [];

      for (const file of valid) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const folder = propertyId ?? user.id;
        const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        setUploadProgress((p) => ({ ...p, [file.name]: 0 }));

        const { error } = await supabase.storage
          .from("listing-images")
          .upload(path, file, { upsert: true });

        if (error) {
          toast({ title: `Erreur : ${file.name}`, description: error.message, variant: "destructive" });
        } else {
          const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
          uploaded.push(data.publicUrl);
          setUploadProgress((p) => ({ ...p, [file.name]: 100 }));
        }
      }

      setUploading(false);
      setUploadProgress({});

      if (uploaded.length > 0) {
        const next = [...images, ...uploaded];
        const cover = mainImage || next[0];
        onChange(next, cover);
        toast({ title: `✅ ${uploaded.length} photo(s) ajoutée(s)` });
      }
    },
    [user, images, mainImage, onChange, propertyId],
  );

  // ── Drag events ───────────────────────────────────────────────
  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const files = Array.from(e.dataTransfer.files);
      uploadFiles(files);
    },
    [disabled, uploadFiles],
  );

  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); if (!disabled) setDragOver(true); };
  const onDragLeave = () => setDragOver(false);

  // ── Set cover ─────────────────────────────────────────────────
  const setCover = (url: string) => {
    const reordered = [url, ...images.filter((u) => u !== url)];
    onChange(reordered, url);
  };

  // ── Remove image ──────────────────────────────────────────────
  const remove = async (url: string) => {
    // Try to delete from storage (best-effort)
    try {
      const bucket = "listing-images";
      const pathStart = url.indexOf(`/${bucket}/`) + `/${bucket}/`.length;
      const path = url.slice(pathStart);
      await supabase.storage.from(bucket).remove([path]);
    } catch (_) {
      // ignore storage delete errors; the URL is simply removed
    }
    const next = images.filter((u) => u !== url);
    const cover = mainImage === url ? (next[0] ?? "") : (mainImage ?? next[0] ?? "");
    onChange(next, cover);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 py-10 px-6 select-none",
          dragOver
            ? "border-primary bg-primary/8 scale-[1.01]"
            : "border-border hover:border-primary/50 hover:bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed",
          uploading && "pointer-events-none",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => uploadFiles(Array.from(e.target.files ?? []))}
          disabled={disabled}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-9 h-9 text-primary animate-spin" />
            <p className="font-body text-sm font-medium text-primary">Upload en cours…</p>
            <div className="flex flex-wrap gap-1.5 justify-center max-w-xs">
              {Object.entries(uploadProgress).map(([name]) => (
                <span key={name} className="font-body text-xs text-muted-foreground truncate max-w-[120px]">
                  {name}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors",
              dragOver ? "bg-primary/15" : "bg-muted",
            )}>
              <Upload className={cn("w-6 h-6", dragOver ? "text-primary" : "text-muted-foreground")} />
            </div>
            <p className="font-body text-sm text-foreground font-semibold text-center">
              {dragOver ? "Déposez vos photos ici" : "Glissez-déposez vos photos"}
            </p>
            <p className="font-body text-xs text-muted-foreground mt-1 text-center">
              ou <span className="text-primary font-semibold">cliquez pour parcourir</span>
            </p>
            <p className="font-body text-xs text-muted-foreground/70 mt-2 text-center">
              JPG, PNG, WEBP · max {MAX_SIZE_MB} MB / photo
            </p>
          </>
        )}
      </div>

      {/* Photos grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-body text-sm font-semibold text-foreground">
              {images.length} photo{images.length > 1 ? "s" : ""}
              {images.length < 5 && (
                <span className="ml-2 font-normal text-accent">
                  · Recommandé : min. 5 ({5 - images.length} manquante{5 - images.length > 1 ? "s" : ""})
                </span>
              )}
            </p>
            <p className="font-body text-xs text-muted-foreground">
              Survolez pour définir la photo principale ou supprimer
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((url, i) => {
              const isCover = url === mainImage || (i === 0 && !mainImage);
              return (
                <div
                  key={url}
                  className={cn(
                    "relative group rounded-xl overflow-hidden aspect-[4/3] bg-muted border-2 transition-all duration-200",
                    isCover ? "border-primary shadow-card" : "border-transparent hover:border-border",
                  )}
                >
                  <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />

                  {/* Cover badge */}
                  {isCover && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge className="bg-primary text-primary-foreground font-body text-[10px] border-0 gap-1 py-0.5">
                        <Star className="w-2.5 h-2.5" /> Principale
                      </Badge>
                    </div>
                  )}

                  {/* Photo number */}
                  {!isCover && (
                    <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Badge variant="secondary" className="font-body text-[10px] py-0.5">
                        #{i + 1}
                      </Badge>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/45 transition-all duration-200 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => setCover(url)}
                        className="bg-background/95 text-foreground text-xs font-body font-semibold px-3 py-1.5 rounded-lg hover:bg-background transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Star className="w-3 h-3 text-accent" />
                        Définir principale
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(url)}
                      className="w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors shadow-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add more tile */}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-[4/3] rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center gap-2 transition-all duration-200"
            >
              <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
              <span className="font-body text-xs text-muted-foreground">Ajouter</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
