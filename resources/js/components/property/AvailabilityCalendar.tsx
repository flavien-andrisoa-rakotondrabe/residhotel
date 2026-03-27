import { useState } from 'react';
import { format, eachDayOfInterval, parseISO, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

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
            eachDayOfInterval({ start, end }).forEach((d) =>
                unavailable.push(d),
            );
        }
    }
    return unavailable;
}

export default function AvailabilityCalendar({ propertyId }: Props) {
    const [month, setMonth] = useState<Date>(new Date());
    const isUUID = propertyId && /^[0-9a-f-]{36}$/i.test(propertyId);

    const { data: entries = [], isLoading } = useQuery({
        queryKey: ['availability', propertyId],
        enabled: !!isUUID,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('property_availability')
                .select('start_date, end_date, is_available')
                .eq('property_id', propertyId!);
            if (error) throw error;
            return data as AvailabilityEntry[];
        },
    });

    const unavailableDates = buildUnavailableDates(entries);

    const isUnavailable = (date: Date) =>
        unavailableDates.some(
            (d) => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'),
        );

    const hasRealData = isUUID && entries.length > 0;

    // Static fallback ranges when no DB data (demo mode for static properties)
    const staticBooked = !hasRealData
        ? [
              {
                  from: new Date(Date.now() + 5 * 86400000),
                  to: new Date(Date.now() + 9 * 86400000),
              },
              {
                  from: new Date(Date.now() + 18 * 86400000),
                  to: new Date(Date.now() + 22 * 86400000),
              },
          ]
        : [];

    const isStaticBooked = (date: Date) =>
        staticBooked.some((r) => date >= r.from && date <= r.to);

    const disabledFn = (date: Date) =>
        date < startOfDay(new Date()) ||
        (hasRealData ? isUnavailable(date) : isStaticBooked(date));

    const modifiers = hasRealData
        ? { unavailable: unavailableDates }
        : {
              booked: staticBooked.flatMap((r) =>
                  eachDayOfInterval({ start: r.from, end: r.to }),
              ),
          };

    const modifiersClassNames = hasRealData
        ? {
              unavailable:
                  'bg-destructive/15 text-destructive line-through rounded-none',
          }
        : {
              booked: 'bg-destructive/15 text-destructive line-through rounded-none',
          };

    return (
        <div>
            <h3 className="font-display mb-2 text-xl font-bold text-foreground">
                Disponibilités
            </h3>
            <p className="font-body mb-5 text-sm text-muted-foreground">
                {isLoading
                    ? 'Chargement du calendrier...'
                    : hasRealData
                      ? "Les dates barrées sont indisponibles selon l'hôte."
                      : 'Les dates en rouge sont déjà réservées.'}
            </p>

            <div className="inline-block w-full overflow-x-auto rounded-2xl border border-border bg-card p-1 shadow-card">
                {isLoading ? (
                    <div className="grid grid-cols-2 gap-4 p-4">
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
                        className={cn('font-body pointer-events-auto p-3')}
                        locale={fr}
                    />
                )}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-5">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-sm bg-primary" />
                    <span className="font-body text-xs text-muted-foreground">
                        Disponible
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative h-4 w-4 rounded-sm bg-destructive/20">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-px w-full rotate-12 bg-destructive" />
                        </div>
                    </div>
                    <span className="font-body text-xs text-muted-foreground">
                        Indisponible
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-sm border border-primary/40 bg-primary/20" />
                    <span className="font-body text-xs text-muted-foreground">
                        Sélectionné
                    </span>
                </div>
            </div>
        </div>
    );
}
