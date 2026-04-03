import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format, eachDayOfInterval, parseISO, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface AvailabilityEntry {
  start_date: string;
  end_date: string;
  is_available: boolean;
}

interface Props {
  propertyId?: string;
}

function buildUnavailableDates(entries: AvailabilityEntry[]): Date[] {
  const unavailable: Date[] = [];
  for (const entry of entries) {
    if (!entry.is_available) {
      const start = parseISO(entry.start_date);
      const end = parseISO(entry.end_date);
      eachDayOfInterval({ start, end }).forEach((d) => unavailable.push(d));
    }
  }
  return unavailable;
}

export default function AvailabilityCalendar({ propertyId }: Props) {
  const [month, setMonth] = useState<Date>(new Date());
  const isUUID = propertyId && /^[0-9a-f-]{36}$/i.test(propertyId);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["availability", propertyId],
    enabled: !!isUUID,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_availability")
        .select("start_date, end_date, is_available")
        .eq("property_id", propertyId!);
      if (error) throw error;
      return data as AvailabilityEntry[];
    },
  });

  const unavailableDates = buildUnavailableDates(entries);

  const isUnavailable = (date: Date) =>
    unavailableDates.some(
      (d) => format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );

  const hasRealData = isUUID && entries.length > 0;

  // Static fallback ranges when no DB data (demo mode for static properties)
  const staticBooked = !hasRealData
    ? [
        { from: new Date(Date.now() + 5 * 86400000), to: new Date(Date.now() + 9 * 86400000) },
        { from: new Date(Date.now() + 18 * 86400000), to: new Date(Date.now() + 22 * 86400000) },
      ]
    : [];

  const isStaticBooked = (date: Date) =>
    staticBooked.some((r) => date >= r.from && date <= r.to);

  const disabledFn = (date: Date) =>
    date < startOfDay(new Date()) ||
    (hasRealData ? isUnavailable(date) : isStaticBooked(date));

  const modifiers = hasRealData
    ? { unavailable: unavailableDates }
    : { booked: staticBooked.flatMap((r) => eachDayOfInterval({ start: r.from, end: r.to })) };

  const modifiersClassNames = hasRealData
    ? { unavailable: "bg-destructive/15 text-destructive line-through rounded-none" }
    : { booked: "bg-destructive/15 text-destructive line-through rounded-none" };

  return (
    <div>
      <h3 className="font-display text-xl font-bold text-foreground mb-2">
        Disponibilités
      </h3>
      <p className="font-body text-muted-foreground text-sm mb-5">
        {isLoading
          ? "Chargement du calendrier..."
          : hasRealData
          ? "Les dates barrées sont indisponibles selon l'hôte."
          : "Les dates en rouge sont déjà réservées."}
      </p>

      <div className="bg-card rounded-2xl border border-border p-1 shadow-card inline-block w-full overflow-x-auto">
        {isLoading ? (
          <div className="p-4 grid grid-cols-2 gap-4">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        ) : (
          <Calendar
            mode="range"
            month={month}
            onMonthChange={setMonth}
            numberOfMonths={2}
            disabled={disabledFn}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            className={cn("p-3 pointer-events-auto font-body")}
            locale={fr}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-5 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-primary" />
          <span className="font-body text-xs text-muted-foreground">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-destructive/20 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-px bg-destructive rotate-12" />
            </div>
          </div>
          <span className="font-body text-xs text-muted-foreground">Indisponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-primary/20 border border-primary/40" />
          <span className="font-body text-xs text-muted-foreground">Sélectionné</span>
        </div>
      </div>
    </div>
  );
}
