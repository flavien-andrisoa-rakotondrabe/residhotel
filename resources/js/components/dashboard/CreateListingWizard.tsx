import { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft, ArrowRight, Check, X, MapPin, Home,
  DollarSign, Eye, Loader2, Image as ImageIcon,
  Wifi, Wind, Flame, UtensilsCrossed, WashingMachine, Tv, Car,
  Waves, Bath, Shield, Dumbbell, Coffee, Lock, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import ImageUploadZone from "./ImageUploadZone";

// ── Schema ────────────────────────────────────────────────────────────────────
const wizardSchema = z.object({
  // Step 1 – Info
  title: z.string().min(5, "Titre requis (5 min)"),
  type: z.string().min(1),
  rental_type: z.string().min(1),
  guests: z.coerce.number().min(1).max(30),
  bedrooms: z.coerce.number().min(0).max(20),
  beds: z.coerce.number().min(1).max(40),
  bathrooms: z.coerce.number().min(1).max(20),
  surface: z.coerce.number().optional(),
  floor: z.coerce.number().optional(),
  elevator: z.boolean().default(false),
  description: z.string().optional(),
  // Step 2 – Location
  address: z.string().optional(),
  location: z.string().min(2, "Ville requise"),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  access_notes: z.string().optional(),
  // Step 3 – Photos (URLs from storage)
  image: z.string().optional(),
  images: z.array(z.string()).default([]),
  // Step 4 – Amenities
  amenities: z.array(z.string()).default([]),
  // House rules
  checkin_time: z.string().optional(),
  checkout_time: z.string().optional(),
  pets_allowed: z.boolean().default(false),
  smoking_allowed: z.boolean().default(false),
  events_allowed: z.boolean().default(false),
  house_rules: z.string().optional(),
  // Step 5 – Pricing
  price: z.coerce.number().min(1, "Prix requis"),
  weekend_price: z.coerce.number().optional(),
  weekly_price: z.coerce.number().optional(),
  monthly_price: z.coerce.number().optional(),
  cleaning_fee: z.coerce.number().default(0),
  security_deposit: z.coerce.number().default(0),
  cancellation: z.string().default("flexible"),
  min_stay: z.coerce.number().default(1),
  max_stay: z.coerce.number().optional(),
  instant_book: z.boolean().default(true),
  notice_period: z.coerce.number().default(1),
});

type WizardForm = z.infer<typeof wizardSchema>;

// ── Constants ─────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Infos", icon: Home },
  { id: 2, label: "Localisation", icon: MapPin },
  { id: 3, label: "Photos", icon: ImageIcon },
  { id: 4, label: "Équipements", icon: Check },
  { id: 5, label: "Prix", icon: DollarSign },
  { id: 6, label: "Publication", icon: Eye },
];

const PROPERTY_TYPES = ["Appartement", "Maison", "Villa", "Studio", "Loft", "Chalet", "Chambre d'hôtes", "Penthouse"];
const RENTAL_TYPES = ["Logement entier", "Chambre privée", "Chambre partagée"];
const CANCELLATION_POLICIES = [
  { value: "flexible", label: "Flexible", desc: "Remboursement intégral jusqu'à 24h avant" },
  { value: "moderate", label: "Modérée", desc: "Remboursement intégral jusqu'à 5 jours avant" },
  { value: "strict", label: "Stricte", desc: "Remboursement 50% jusqu'à 7 jours avant" },
];

const AMENITIES_LIST = [
  { value: "WiFi", icon: Wifi, label: "WiFi" },
  { value: "Climatisation", icon: Wind, label: "Climatisation" },
  { value: "Chauffage", icon: Flame, label: "Chauffage" },
  { value: "Cuisine équipée", icon: UtensilsCrossed, label: "Cuisine équipée" },
  { value: "Lave-linge", icon: WashingMachine, label: "Lave-linge" },
  { value: "Télévision", icon: Tv, label: "Télévision" },
  { value: "Parking", icon: Car, label: "Parking" },
  { value: "Piscine", icon: Waves, label: "Piscine" },
  { value: "Baignoire", icon: Bath, label: "Baignoire/Jacuzzi" },
  { value: "Sécurité", icon: Shield, label: "Alarme/Sécurité" },
  { value: "Salle de sport", icon: Dumbbell, label: "Salle de sport" },
  { value: "Machine à café", icon: Coffee, label: "Machine à café" },
  { value: "Coffre-fort", icon: Lock, label: "Coffre-fort" },
];

interface Props {
  onClose: () => void;
  editData?: Partial<WizardForm> & { id?: string };
}

export default function CreateListingWizard({ onClose, editData }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const isEditing = !!editData?.id;

  const form = useForm<WizardForm>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      type: "Appartement",
      rental_type: "Logement entier",
      guests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      amenities: [],
      images: [],
      price: 80,
      cleaning_fee: 0,
      security_deposit: 0,
      cancellation: "flexible",
      min_stay: 1,
      instant_book: true,
      notice_period: 1,
      pets_allowed: false,
      smoking_allowed: false,
      events_allowed: false,
      elevator: false,
      ...editData,
    },
  });

  const { watch, setValue, getValues } = form;
  const amenities = watch("amenities") ?? [];
  const images = watch("images") ?? [];
  const mainImage = watch("image");

  // ── Image upload ─────────────────────────────────────────────────────────────
  const handleImageUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setUploadingImages(true);
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `${user!.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage
          .from("listing-images")
          .upload(path, file, { upsert: true });
        if (!error) {
          const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
          uploaded.push(data.publicUrl);
        }
      }
      if (uploaded.length > 0) {
        const current = getValues("images") ?? [];
        const allImages = [...current, ...uploaded];
        setValue("images", allImages);
        if (!getValues("image")) setValue("image", allImages[0]);
        toast({ title: `${uploaded.length} photo(s) ajoutée(s)` });
      }
      setUploadingImages(false);
    },
    [user, getValues, setValue],
  );

  const removeImage = (url: string) => {
    const current = getValues("images") ?? [];
    const updated = current.filter((u) => u !== url);
    setValue("images", updated);
    if (getValues("image") === url) setValue("image", updated[0] ?? "");
  };

  const toggleAmenity = (value: string) => {
    const current = getValues("amenities") ?? [];
    setValue(
      "amenities",
      current.includes(value) ? current.filter((a) => a !== value) : [...current, value],
    );
  };

  // ── Save draft / publish ──────────────────────────────────────────────────────
  const saveDraft = async (publish = false) => {
    const values = getValues();
    setSaving(true);
    try {
      const payload = {
        host_id: user!.id,
        title: values.title,
        description: values.description ?? null,
        type: values.type,
        rental_type: values.rental_type,
        guests: values.guests,
        bedrooms: values.bedrooms,
        beds: values.beds,
        bathrooms: values.bathrooms,
        surface: values.surface ?? null,
        floor: values.floor ?? null,
        elevator: values.elevator,
        address: values.address ?? null,
        location: values.location,
        postal_code: values.postal_code ?? null,
        country: values.country ?? null,
        access_notes: values.access_notes ?? null,
        image: values.image || values.images?.[0] || null,
        images: values.images ?? [],
        amenities: values.amenities ?? [],
        checkin_time: values.checkin_time ?? null,
        checkout_time: values.checkout_time ?? null,
        pets_allowed: values.pets_allowed,
        smoking_allowed: values.smoking_allowed,
        events_allowed: values.events_allowed,
        house_rules: values.house_rules ?? null,
        price: values.price,
        weekend_price: values.weekend_price ?? null,
        weekly_price: values.weekly_price ?? null,
        monthly_price: values.monthly_price ?? null,
        cleaning_fee: values.cleaning_fee,
        security_deposit: values.security_deposit,
        cancellation: values.cancellation,
        min_stay: values.min_stay,
        max_stay: values.max_stay ?? null,
        instant_book: values.instant_book,
        notice_period: values.notice_period,
        status: publish ? "published" : "draft",
        active: publish,
      };

      if (isEditing && editData?.id) {
        const { error } = await supabase
          .from("properties")
          .update(payload)
          .eq("id", editData.id)
          .eq("host_id", user!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("properties").insert(payload);
        if (error) throw error;
      }

      qc.invalidateQueries({ queryKey: ["host-properties"] });
      qc.invalidateQueries({ queryKey: ["properties"] });
      toast({ title: publish ? "Annonce publiée 🎉" : "Brouillon sauvegardé ✓" });
      if (publish) onClose();
    } catch (err: unknown) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const goNext = async () => {
    // Validate current step fields before advancing
    const fieldsPerStep: Record<number, (keyof WizardForm)[]> = {
      1: ["title", "type", "rental_type", "guests", "bedrooms", "beds", "bathrooms"],
      2: ["location"],
      3: [],
      4: [],
      5: ["price"],
    };
    const valid = await form.trigger(fieldsPerStep[step] ?? []);
    if (!valid) return;
    if (step < 6) setStep((s) => s + 1);
  };

  const values = watch();
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  // ── Render steps ─────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Top bar */}
      <div className="shrink-0 border-b border-border bg-card px-4 sm:px-8 py-4 flex items-center gap-4">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
        >
          <X className="w-4 h-4" /> Fermer
        </button>
        <div className="flex-1 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s) => (
              <button
                key={s.id}
                onClick={() => s.id < step && setStep(s.id)}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all",
                  s.id === step ? "opacity-100" : s.id < step ? "opacity-70 cursor-pointer" : "opacity-30 cursor-default",
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-display transition-all",
                    s.id < step
                      ? "bg-primary text-primary-foreground"
                      : s.id === step
                      ? "bg-gradient-brand text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {s.id < step ? <Check className="w-3.5 h-3.5" /> : s.id}
                </div>
                <span className="font-body text-[10px] hidden sm:block">{s.label}</span>
              </button>
            ))}
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
        <button
          onClick={() => saveDraft(false)}
          disabled={saving}
          className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sauvegarder"}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 sm:px-8 py-8 space-y-6">

          {/* ── Step 1: Informations générales ── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Informations générales</h2>
                <p className="font-body text-muted-foreground text-sm mt-1">Décrivez votre logement en quelques mots.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="font-body text-sm font-semibold">Titre de l'annonce *</Label>
                  <Input
                    {...form.register("title")}
                    placeholder="Ex: Magnifique villa avec vue mer à Cannes..."
                    className="mt-1.5 font-body"
                  />
                  {form.formState.errors.title && (
                    <p className="text-xs text-destructive mt-1">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-body text-sm font-semibold">Type de logement *</Label>
                    <Controller
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="mt-1.5 font-body">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PROPERTY_TYPES.map((t) => (
                              <SelectItem key={t} value={t} className="font-body">{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div>
                    <Label className="font-body text-sm font-semibold">Type de location *</Label>
                    <Controller
                      control={form.control}
                      name="rental_type"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="mt-1.5 font-body">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {RENTAL_TYPES.map((t) => (
                              <SelectItem key={t} value={t} className="font-body">{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {(
                    [
                      { name: "guests", label: "Voyageurs", min: 1 },
                      { name: "bedrooms", label: "Chambres", min: 0 },
                      { name: "beds", label: "Lits", min: 1 },
                      { name: "bathrooms", label: "SDB", min: 1 },
                    ] as const
                  ).map(({ name, label, min }) => (
                    <div key={name}>
                      <Label className="font-body text-sm font-semibold">{label}</Label>
                      <Input
                        type="number"
                        min={min}
                        {...form.register(name)}
                        className="mt-1.5 font-body"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-body text-sm font-semibold">Surface (m²)</Label>
                    <Input type="number" {...form.register("surface")} placeholder="85" className="mt-1.5 font-body" />
                  </div>
                  <div>
                    <Label className="font-body text-sm font-semibold">Étage</Label>
                    <Input type="number" {...form.register("floor")} placeholder="3" className="mt-1.5 font-body" />
                  </div>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <Controller
                    control={form.control}
                    name="elevator"
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <Label className="font-body text-sm">Ascenseur disponible</Label>
                </div>

                <div>
                  <Label className="font-body text-sm font-semibold">Description</Label>
                  <Textarea
                    {...form.register("description")}
                    rows={4}
                    placeholder="Décrivez votre logement, ses atouts, l'environnement, l'ambiance..."
                    className="mt-1.5 font-body resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Localisation ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Localisation</h2>
                <p className="font-body text-muted-foreground text-sm mt-1">Indiquez l'adresse de votre bien.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="font-body text-sm font-semibold">Adresse</Label>
                  <Input {...form.register("address")} placeholder="12 rue des Oliviers" className="mt-1.5 font-body" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-body text-sm font-semibold">Ville *</Label>
                    <Input {...form.register("location")} placeholder="Paris, Marrakech..." className="mt-1.5 font-body" />
                    {form.formState.errors.location && (
                      <p className="text-xs text-destructive mt-1">{form.formState.errors.location.message}</p>
                    )}
                  </div>
                  <div>
                    <Label className="font-body text-sm font-semibold">Code postal</Label>
                    <Input {...form.register("postal_code")} placeholder="75001" className="mt-1.5 font-body" />
                  </div>
                </div>

                <div>
                  <Label className="font-body text-sm font-semibold">Pays</Label>
                  <Input {...form.register("country")} placeholder="France" className="mt-1.5 font-body" />
                </div>

                <div>
                  <Label className="font-body text-sm font-semibold">Indications d'accès</Label>
                  <Textarea
                    {...form.register("access_notes")}
                    rows={3}
                    placeholder="Digicode : 1234. Sonnette au 2e étage gauche..."
                    className="mt-1.5 font-body resize-none"
                  />
                </div>

                {/* Map placeholder */}
                <div className="rounded-2xl border border-border bg-muted/30 h-52 flex flex-col items-center justify-center gap-2">
                  <MapPin className="w-8 h-8 text-muted-foreground" />
                  <p className="font-body text-sm text-muted-foreground text-center">
                    La carte interactive s'affichera<br />automatiquement selon l'adresse saisie.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Photos ── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Photos & médias</h2>
                <p className="font-body text-muted-foreground text-sm mt-1">
                  Glissez-déposez vos photos ou cliquez pour parcourir. La première photo sera la couverture.
                </p>
              </div>

              <ImageUploadZone
                images={images}
                mainImage={mainImage ?? images[0]}
                onChange={(nextImages, nextMain) => {
                  setValue("images", nextImages);
                  setValue("image", nextMain);
                }}
                propertyId={editData?.id}
              />
            </div>
          )}


          {/* ── Step 4: Équipements + Règlement ── */}
          {step === 4 && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Équipements & règlement</h2>
                <p className="font-body text-muted-foreground text-sm mt-1">Sélectionnez les équipements et définissez les règles.</p>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="font-display text-base font-bold mb-3">Équipements disponibles</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AMENITIES_LIST.map(({ value, icon: Icon, label }) => {
                    const checked = amenities.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleAmenity(value)}
                        className={cn(
                          "flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left font-body text-sm",
                          checked
                            ? "border-primary bg-primary/8 text-primary"
                            : "border-border bg-card text-foreground hover:border-primary/40",
                        )}
                      >
                        <Icon className={cn("w-4 h-4 shrink-0", checked ? "text-primary" : "text-muted-foreground")} />
                        {label}
                        {checked && <Check className="w-3.5 h-3.5 ml-auto text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rules */}
              <div>
                <h3 className="font-display text-base font-bold mb-3">Règlement intérieur</h3>
                <div className="space-y-4 bg-muted/30 rounded-2xl p-4 border border-border">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-body text-sm font-semibold">Check-in</Label>
                      <Input type="time" {...form.register("checkin_time")} defaultValue="15:00" className="mt-1.5 font-body" />
                    </div>
                    <div>
                      <Label className="font-body text-sm font-semibold">Check-out</Label>
                      <Input type="time" {...form.register("checkout_time")} defaultValue="11:00" className="mt-1.5 font-body" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(
                      [
                        { name: "pets_allowed", label: "Animaux autorisés" },
                        { name: "smoking_allowed", label: "Fumeurs autorisés" },
                        { name: "events_allowed", label: "Événements autorisés" },
                      ] as const
                    ).map(({ name, label }) => (
                      <div key={name} className="flex items-center justify-between py-1">
                        <Label className="font-body text-sm">{label}</Label>
                        <Controller
                          control={form.control}
                          name={name}
                          render={({ field }) => (
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          )}
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <Label className="font-body text-sm font-semibold">Règles spécifiques</Label>
                    <Textarea
                      {...form.register("house_rules")}
                      rows={3}
                      placeholder="Ex: Pas de musique après 22h. Poubelles à sortir le lundi..."
                      className="mt-1.5 font-body resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 5: Tarification + Disponibilités ── */}
          {step === 5 && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Tarification & conditions</h2>
                <p className="font-body text-muted-foreground text-sm mt-1">Définissez vos prix et conditions de réservation.</p>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="font-display text-base font-bold">Prix</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-body text-sm font-semibold">Prix par nuit (€) *</Label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-body text-sm">€</span>
                      <Input type="number" {...form.register("price")} className="pl-7 font-body" />
                    </div>
                    {form.formState.errors.price && (
                      <p className="text-xs text-destructive mt-1">{form.formState.errors.price.message}</p>
                    )}
                  </div>
                  <div>
                    <Label className="font-body text-sm font-semibold">Prix week-end (€)</Label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-body text-sm">€</span>
                      <Input type="number" {...form.register("weekend_price")} className="pl-7 font-body" placeholder="Optionnel" />
                    </div>
                  </div>
                  <div>
                    <Label className="font-body text-sm font-semibold">Prix semaine (€)</Label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-body text-sm">€</span>
                      <Input type="number" {...form.register("weekly_price")} className="pl-7 font-body" placeholder="Optionnel" />
                    </div>
                  </div>
                  <div>
                    <Label className="font-body text-sm font-semibold">Prix mensuel (€)</Label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-body text-sm">€</span>
                      <Input type="number" {...form.register("monthly_price")} className="pl-7 font-body" placeholder="Optionnel" />
                    </div>
                  </div>
                  <div>
                    <Label className="font-body text-sm font-semibold">Frais de ménage (€)</Label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-body text-sm">€</span>
                      <Input type="number" {...form.register("cleaning_fee")} className="pl-7 font-body" />
                    </div>
                  </div>
                  <div>
                    <Label className="font-body text-sm font-semibold">Caution (€)</Label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-body text-sm">€</span>
                      <Input type="number" {...form.register("security_deposit")} className="pl-7 font-body" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Availability conditions */}
              <div className="space-y-4">
                <h3 className="font-display text-base font-bold">Disponibilités & réservation</h3>

                <div className="flex items-center justify-between py-2 px-4 bg-muted/30 rounded-xl border border-border">
                  <div>
                    <p className="font-body text-sm font-semibold">Réservation instantanée</p>
                    <p className="font-body text-xs text-muted-foreground">Le voyageur peut réserver sans approbation</p>
                  </div>
                  <Controller
                    control={form.control}
                    name="instant_book"
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="font-body text-sm font-semibold">Séjour min. (nuits)</Label>
                    <Input type="number" min={1} {...form.register("min_stay")} className="mt-1.5 font-body" />
                  </div>
                  <div>
                    <Label className="font-body text-sm font-semibold">Séjour max. (nuits)</Label>
                    <Input type="number" {...form.register("max_stay")} placeholder="Illimité" className="mt-1.5 font-body" />
                  </div>
                  <div>
                    <Label className="font-body text-sm font-semibold">Préavis (jours)</Label>
                    <Input type="number" min={0} {...form.register("notice_period")} className="mt-1.5 font-body" />
                  </div>
                </div>
              </div>

              {/* Cancellation */}
              <div>
                <h3 className="font-display text-base font-bold mb-3">Politique d'annulation</h3>
                <div className="space-y-3">
                  {CANCELLATION_POLICIES.map(({ value, label, desc }) => (
                    <label
                      key={value}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                        watch("cancellation") === value
                          ? "border-primary bg-primary/8"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      <Controller
                        control={form.control}
                        name="cancellation"
                        render={({ field }) => (
                          <input
                            type="radio"
                            value={value}
                            checked={field.value === value}
                            onChange={() => field.onChange(value)}
                            className="mt-0.5 accent-primary"
                          />
                        )}
                      />
                      <div>
                        <p className="font-body text-sm font-semibold">{label}</p>
                        <p className="font-body text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 6: Aperçu & Publication ── */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Aperçu & publication</h2>
                <p className="font-body text-muted-foreground text-sm mt-1">Vérifiez votre annonce avant de la publier.</p>
              </div>

              {/* Preview card */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card">
                {/* Images preview */}
                <div className="relative h-52 bg-muted">
                  {(mainImage || images[0]) ? (
                    <img src={mainImage || images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <ImageIcon className="w-12 h-12 text-muted-foreground" />
                      <p className="font-body text-sm text-muted-foreground">Aucune photo</p>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-background/90 text-foreground font-body text-xs border-0 backdrop-blur-sm">
                      {values.type}
                    </Badge>
                    {values.rental_type && (
                      <Badge className="bg-background/90 text-foreground font-body text-xs border-0 backdrop-blur-sm">
                        {values.rental_type}
                      </Badge>
                    )}
                    <Badge className="font-body text-xs border-0 bg-accent/20 text-accent-foreground">
                      Brouillon
                    </Badge>
                  </div>
                  {images.length > 1 && (
                    <div className="absolute bottom-3 right-3">
                      <Badge className="bg-background/90 text-foreground font-body text-xs border-0">
                        {images.length} photos
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-display text-lg font-bold">{values.title || "Sans titre"}</h3>
                      <p className="font-body text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {[values.address, values.location, values.country].filter(Boolean).join(", ") || "Adresse non définie"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-display text-2xl font-bold text-primary">{values.price}€</span>
                      <span className="font-body text-xs text-muted-foreground"> / nuit</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs font-body text-muted-foreground">
                    <span>{values.guests} voyageurs</span>
                    <span>·</span>
                    <span>{values.bedrooms} ch.</span>
                    <span>·</span>
                    <span>{values.beds} lit(s)</span>
                    <span>·</span>
                    <span>{values.bathrooms} sdb</span>
                    {values.surface && <><span>·</span><span>{values.surface} m²</span></>}
                  </div>

                  {amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {amenities.slice(0, 5).map((a) => (
                        <Badge key={a} variant="outline" className="font-body text-xs">{a}</Badge>
                      ))}
                      {amenities.length > 5 && (
                        <Badge variant="outline" className="font-body text-xs">+{amenities.length - 5}</Badge>
                      )}
                    </div>
                  )}

                  {/* Summary rows */}
                  <div className="border-t border-border pt-3 space-y-1.5 text-xs font-body text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Frais de ménage</span>
                      <span>{values.cleaning_fee}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Caution</span>
                      <span>{values.security_deposit}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annulation</span>
                      <span className="capitalize">{values.cancellation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Séjour minimum</span>
                      <span>{values.min_stay} nuit(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Réservation instantanée</span>
                      <span>{values.instant_book ? "✓ Oui" : "✗ Non"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quality score */}
              {images.length < 5 && (
                <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
                  <p className="font-body text-sm text-accent font-semibold">⚡ Optimisez votre annonce</p>
                  <p className="font-body text-xs text-accent/80 mt-1">
                    Ajoutez {5 - images.length} photo(s) de plus pour augmenter votre taux de réservation.
                  </p>
                </div>
              )}

              {/* Publish actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => saveDraft(false)}
                  disabled={saving}
                  className="flex-1 font-body font-semibold gap-2 h-12"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                  Sauvegarder en brouillon
                </Button>
                <Button
                  onClick={() => saveDraft(true)}
                  disabled={saving}
                  className="flex-1 bg-gradient-brand text-primary-foreground font-body font-semibold gap-2 h-12 hover:opacity-90"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  Publier l'annonce
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      {step < 6 && (
        <div className="shrink-0 border-t border-border bg-card px-4 sm:px-8 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep((s) => s - 1) : onClose()}
            className="font-body font-semibold gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {step > 1 ? "Retour" : "Annuler"}
          </Button>
          <span className="font-body text-sm text-muted-foreground hidden sm:block">
            Étape {step} sur {STEPS.length}
          </span>
          <Button
            onClick={goNext}
            className="bg-gradient-brand text-primary-foreground font-body font-semibold gap-2 hover:opacity-90"
          >
            Continuer
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
