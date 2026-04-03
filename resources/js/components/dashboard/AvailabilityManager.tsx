import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, eachDayOfInterval, parseISO, isWithinInterval, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  CalendarDays, Plus, Trash2, CheckCircle2, XCircle, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { DateRange } from "react-day-picker";

interface AvailabilityEntry {
  id: string;
  property_id: string;
  host_id: string;
  start_date: string;
  end_date: string;
  is_available: boolean;
  note: string | null;
  created_at: string;
}

interface Props {
  propertyId: string;
  propertyTitle: string;
}

export default function AvailabilityManager({ propertyId, propertyTitle }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [range, setRange] = useState<DateRange | undefined>();
  const [isAvailable, setIsAvailable] = useState(true);
  const [note, setNote] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // ── Fetch entries ─────────────────────────────────────────────
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["availability", propertyId],
    enabled: !!propertyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_availability")
        .select("*")
        .eq("property_id", propertyId)
        .order("start_date", { ascending: true });
      if (error) throw error;
      return data as AvailabilityEntry[];
    },
  });

  // ── Derived: build a set of unavailable date strings ─────────
  const unavailableDates: Date[] = [];
  const availableRanges: DateRange[] = [];

  for (const entry of entries) {
    const start = parseISO(entry.start_date);
    const end = parseISO(entry.end_date);
    if (!entry.is_available) {
      eachDayOfInterval({ start, end }).forEach((d) => unavailableDates.push(d));
    } else {
      availableRanges.push({ from: start, to: end });
    }
  }

  // ── Add mutation ──────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: async () => {
      if (!range?.from || !range?.to) throw new Error("Sélectionnez une plage de dates.");
      const { error } = await supabase.from("property_availability").insert({
        property_id: propertyId,
        host_id: user!.id,
        start_date: format(range.from, "yyyy-MM-dd"),
        end_date: format(range.to, "yyyy-MM-dd"),
        is_available: isAvailable,
        note: note.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["availability", propertyId] });
      setRange(undefined);
      setNote("");
      setIsAvailable(true);
      setOpen(false);
      toast({ title: "Plage enregistrée", description: "Le calendrier a été mis à jour." });
    },
    onError: (e: Error) => {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    },
  });

  // ── Delete mutation ───────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("property_availability").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["availability", propertyId] });
      setDeleteId(null);
      toast({ title: "Plage supprimée" });
    },
    onError: (e: Error) => {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Calendrier de disponibilité
          </h3>
          <p className="font-body text-xs text-muted-foreground mt-0.5">{propertyTitle}</p>
        </div>
        <Button
          size="sm"
          className="bg-gradient-brand text-primary-foreground hover:opacity-90 font-body gap-1.5"
          onClick={() => setOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Ajouter une plage
        </Button>
      </div>

      {/* Visual calendar (read-only overview) */}
      <div className="bg-card rounded-xl border border-border p-3 overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Calendar
            mode="range"
            numberOfMonths={2}
            disabled={(date) =>
              date < startOfDay(new Date()) ||
              unavailableDates.some(
                (d) => format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
              )
            }
            modifiers={{
              unavailable: unavailableDates,
            }}
            modifiersClassNames={{
              unavailable: "bg-destructive/15 text-destructive line-through rounded-none",
            }}
            className="font-body pointer-events-none"
            locale={fr}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {[
          { extraClass: "bg-primary/20 border border-primary/40", label: "Disponible (défini)" },
          { extraClass: "bg-destructive/15", label: "Indisponible" },
          { extraClass: "bg-muted", label: "Non défini" },
        ].map(({ extraClass, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={cn("w-4 h-4 rounded-sm", extraClass)} />
            <span className="font-body text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      <Separator />

      {/* Entries list */}
      <div className="space-y-2">
        <h4 className="font-body text-sm font-semibold text-foreground">
          Plages définies ({entries.length})
        </h4>
        {entries.length === 0 && (
          <p className="font-body text-sm text-muted-foreground italic">
            Aucune plage définie. Ajoutez des disponibilités pour que les voyageurs puissent réserver.
          </p>
        )}
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between gap-3 bg-card border border-border rounded-xl px-4 py-3"
          >
            <div className="flex items-center gap-3">
              {entry.is_available ? (
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive shrink-0" />
              )}
              <div>
                <p className="font-body text-sm font-medium text-foreground">
                  {format(parseISO(entry.start_date), "d MMM yyyy", { locale: fr })}
                  {" → "}
                  {format(parseISO(entry.end_date), "d MMM yyyy", { locale: fr })}
                </p>
                {entry.note && (
                  <p className="font-body text-xs text-muted-foreground">{entry.note}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge
                variant={entry.is_available ? "secondary" : "destructive"}
                className="font-body text-xs"
              >
                {entry.is_available ? "Disponible" : "Bloqué"}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => setDeleteId(entry.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md font-body">
          <DialogHeader>
            <DialogTitle className="font-display">Définir une plage de dates</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              disabled={(date) => date < startOfDay(new Date())}
              numberOfMonths={1}
              className="rounded-xl border border-border mx-auto"
              locale={fr}
            />

            {range?.from && range?.to && (
              <div className="bg-secondary/40 rounded-xl px-4 py-2 border border-border font-body text-sm text-center text-foreground">
                {format(range.from, "d MMM yyyy", { locale: fr })}
                {" → "}
                {format(range.to, "d MMM yyyy", { locale: fr })}
                {" · "}
                {eachDayOfInterval({ start: range.from, end: range.to }).length} jour(s)
              </div>
            )}

            <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
              <div>
                <Label className="font-body text-sm font-semibold">
                  {isAvailable ? "Disponible à la réservation" : "Bloquer ces dates"}
                </Label>
                <p className="font-body text-xs text-muted-foreground mt-0.5">
                  {isAvailable
                    ? "Les voyageurs pourront choisir ces dates"
                    : "Les voyageurs ne pourront pas réserver ces dates"}
                </p>
              </div>
              <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
            </div>

            <div className="space-y-1.5">
              <Label className="font-body text-sm font-medium">Note (optionnel)</Label>
              <Textarea
                placeholder="Ex : Travaux, entretien, séjour personnel..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="font-body text-sm resize-none"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="font-body">
              Annuler
            </Button>
            <Button
              onClick={() => addMutation.mutate()}
              disabled={!range?.from || !range?.to || addMutation.isPending}
              className="bg-gradient-brand text-primary-foreground hover:opacity-90 font-body gap-2"
            >
              {addMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm dialog ── */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm font-body">
          <DialogHeader>
            <DialogTitle className="font-display">Supprimer cette plage ?</DialogTitle>
          </DialogHeader>
          <p className="font-body text-sm text-muted-foreground">
            Cette action est irréversible. Le calendrier sera mis à jour immédiatement.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="font-body">Annuler</Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              className="font-body gap-2"
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
