import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, differenceInDays, eachDayOfInterval, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarIcon, Users, ChevronDown, ChevronUp,
  Shield, Star, CreditCard, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

const bookingSchema = z.object({
  checkIn: z.date({ required_error: "Choisissez une date d'arrivée." }),
  checkOut: z.date({ required_error: "Choisissez une date de départ." }),
  adults: z.number().min(1).max(10),
  children: z.number().min(0).max(8),
}).refine((d) => !d.checkOut || !d.checkIn || d.checkOut > d.checkIn, {
  message: "Le départ doit être après l'arrivée.",
  path: ["checkOut"],
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface Props {
  propertyId?: string | number;
  propertyTitle?: string;
  propertyImage?: string;
  propertyLocation?: string;
  pricePerNight?: number;
  rating?: number;
  reviewCount?: number;
}


export default function BookingForm({
  propertyId = "1",
  propertyTitle = "Villa Bord de Mer",
  propertyImage = "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400",
  propertyLocation = "Maldives",
  pricePerNight = 680,
  rating = 5.0,
  reviewCount = 87,
}: Props) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { settings: platformSettings } = usePlatformSettings();

  const isUUID = propertyId && /^[0-9a-f-]{36}$/i.test(String(propertyId));

  // Fetch availability entries from DB
  const { data: availabilityEntries = [] } = useQuery({
    queryKey: ["availability", propertyId],
    enabled: !!isUUID,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_availability")
        .select("start_date, end_date, is_available")
        .eq("property_id", String(propertyId));
      if (error) throw error;
      return data as { start_date: string; end_date: string; is_available: boolean }[];
    },
  });

  // Also fetch confirmed bookings to block those dates
  const { data: existingBookings = [] } = useQuery({
    queryKey: ["bookings-dates", propertyId],
    enabled: !!propertyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("check_in, check_out")
        .eq("property_id", String(propertyId))
        .eq("status", "confirmed");
      if (error) throw error;
      return data as { check_in: string; check_out: string }[];
    },
  });

  // Build set of unavailable date strings
  const unavailableDateSet = new Set<string>();

  // Block dates marked unavailable by host
  for (const entry of availabilityEntries) {
    if (!entry.is_available) {
      eachDayOfInterval({
        start: parseISO(entry.start_date),
        end: parseISO(entry.end_date),
      }).forEach((d) => unavailableDateSet.add(format(d, "yyyy-MM-dd")));
    }
  }

  // Block already-confirmed bookings
  for (const booking of existingBookings) {
    eachDayOfInterval({
      start: parseISO(booking.check_in),
      end: parseISO(booking.check_out),
    }).forEach((d) => unavailableDateSet.add(format(d, "yyyy-MM-dd")));
  }

  const isDateUnavailable = (date: Date) =>
    unavailableDateSet.has(format(date, "yyyy-MM-dd"));

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { adults: 2, children: 0 },
  });

  const checkIn = form.watch("checkIn");
  const checkOut = form.watch("checkOut");
  const adults = form.watch("adults");
  const children = form.watch("children");

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const subtotal = nights * pricePerNight;
  // Frais de service dynamiques issus de platform_settings
  const travelerFeeRate = platformSettings.travelerFeeRate;   // ex: 0.10 = 10%
  const serviceFeeFixed = platformSettings.serviceFeeFixed;   // ex: 1.5 €
  const serviceFee = Math.round(subtotal * travelerFeeRate + serviceFeeFixed);
  const total = subtotal + serviceFee;

  const onSubmit = async (data: BookingFormData) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour réserver.",
        variant: "destructive",
      });
      navigate("/auth?tab=login");
      return;
    }

    if (nights <= 0) {
      toast({ title: "Dates invalides", description: "Sélectionnez des dates valides.", variant: "destructive" });
      return;
    }

    setLoading(true);

    // 1. Create the booking in "pending" state first
    const { data: booking, error: insertError } = await supabase
      .from("bookings")
      .insert({
        traveler_id: user.id,
        property_id: String(propertyId),
        property_title: propertyTitle,
        property_image: propertyImage,
        property_location: propertyLocation,
        check_in: format(data.checkIn, "yyyy-MM-dd"),
        check_out: format(data.checkOut, "yyyy-MM-dd"),
        nights,
        guests: data.adults + data.children,
        price_per_night: pricePerNight,
        subtotal,
        service_fee: serviceFee,
        total,
        status: "pending",
        payment_status: "pending",
      })
      .select("id")
      .single();

    if (insertError || !booking) {
      setLoading(false);
      toast({ title: "Erreur de réservation", description: insertError?.message ?? "Erreur inconnue", variant: "destructive" });
      return;
    }

    // 2. Create Stripe Checkout session via edge function
    const origin = window.location.origin;
    const { data: checkoutData, error: fnError } = await supabase.functions.invoke("create-checkout", {
      body: {
        bookingId: booking.id,
        propertyTitle,
        propertyImage,
        nights,
        totalCents: Math.round(total * 100),
        successUrl: `${origin}/payment/success?booking_id=${booking.id}`,
        cancelUrl: `${origin}/property/${propertyId}`,
      },
    });

    setLoading(false);

    if (fnError || !checkoutData?.url) {
      toast({ title: "Erreur de paiement", description: "Impossible d'initialiser le paiement. Réessayez.", variant: "destructive" });
      return;
    }

    // 3. Redirect to Stripe Checkout
    window.location.href = checkoutData.url;
  };




  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Price header */}
        <div className="flex items-baseline gap-1 mb-1">
          <span className="font-display text-3xl font-bold text-foreground">{pricePerNight}€</span>
          <span className="font-body text-muted-foreground text-sm">/ nuit</span>
          <div className="ml-auto flex items-center gap-1">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="font-body text-sm font-semibold">{rating.toFixed(1)}</span>
            <span className="font-body text-xs text-muted-foreground">({reviewCount} avis)</span>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2">
          <FormField control={form.control} name="checkIn" render={({ field }) => (
            <FormItem>
              <Label className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">Arrivée</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-body h-11 border-border", !field.value && "text-muted-foreground")}
                    >
                      <CalendarIcon className="w-4 h-4 mr-2 shrink-0 text-accent" />
                      {field.value ? format(field.value, "d MMM", { locale: fr }) : "Date"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                   <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date() || isDateUnavailable(date)}
                    modifiers={{ unavailable: (date: Date) => isDateUnavailable(date) }}
                    modifiersClassNames={{ unavailable: "bg-destructive/15 text-destructive line-through" }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage className="font-body text-xs" />
            </FormItem>
          )} />
          <FormField control={form.control} name="checkOut" render={({ field }) => (
            <FormItem>
              <Label className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">Départ</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-body h-11 border-border", !field.value && "text-muted-foreground")}
                    >
                      <CalendarIcon className="w-4 h-4 mr-2 shrink-0 text-accent" />
                      {field.value ? format(field.value, "d MMM", { locale: fr }) : "Date"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date <= (checkIn ?? new Date()) || isDateUnavailable(date)}
                    modifiers={{ unavailable: (date: Date) => isDateUnavailable(date) }}
                    modifiersClassNames={{ unavailable: "bg-destructive/15 text-destructive line-through" }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage className="font-body text-xs" />
            </FormItem>
          )} />
        </div>

        {/* Guests */}
        <div>
          <Label className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">Voyageurs</Label>
          <button
            type="button"
            onClick={() => setGuestsOpen(!guestsOpen)}
            className="w-full flex items-center justify-between border border-border rounded-lg px-4 h-11 mt-1.5 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" />
              <span className="font-body text-sm">
                {adults} adulte{adults > 1 ? "s" : ""}{children > 0 ? `, ${children} enfant${children > 1 ? "s" : ""}` : ""}
              </span>
            </div>
            {guestsOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          {guestsOpen && (
            <div className="border border-border rounded-lg mt-1 p-4 space-y-4 animate-fade-in bg-card shadow-card">
              {[
                { label: "Adultes", sub: "13 ans et plus", field: "adults" as const, min: 1, max: platformSettings.maxGuestsPerBooking },
                { label: "Enfants", sub: "2–12 ans", field: "children" as const, min: 0, max: Math.max(0, platformSettings.maxGuestsPerBooking - 1) },
              ].map(({ label, sub, field, min, max }) => (
                <div key={field} className="flex items-center justify-between">
                  <div>
                    <p className="font-body text-sm font-medium">{label}</p>
                    <p className="font-body text-xs text-muted-foreground">{sub}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => form.setValue(field, Math.max(min, form.getValues(field) - 1))}
                      className="w-8 h-8 rounded-full border border-border hover:border-primary flex items-center justify-center font-body text-lg leading-none transition-colors">−</button>
                    <span className="font-body text-sm font-semibold w-5 text-center">{form.watch(field)}</span>
                    <button type="button" onClick={() => form.setValue(field, Math.min(max, form.getValues(field) + 1))}
                      className="w-8 h-8 rounded-full border border-border hover:border-primary flex items-center justify-center font-body text-lg leading-none transition-colors">+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price breakdown */}
        {nights > 0 && (
          <div className="bg-muted/50 rounded-xl p-4 space-y-2 border border-border animate-fade-in">
            <div className="flex justify-between font-body text-sm">
              <span className="text-muted-foreground">{pricePerNight}€ × {nights} nuit{nights > 1 ? "s" : ""}</span>
              <span className="font-medium">{subtotal.toLocaleString("fr-FR")}€</span>
            </div>
            <div className="flex justify-between font-body text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <span>Frais de service Residotel</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                      <Info className="w-3 h-3" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="top" className="w-64 p-3">
                    <p className="font-body text-xs text-foreground font-semibold mb-1">Détail des frais de service</p>
                    <div className="space-y-1 font-body text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Commission ({Math.round(travelerFeeRate * 100)}% du sous-total)</span>
                        <span className="text-foreground font-medium">{Math.round(subtotal * travelerFeeRate).toLocaleString("fr-FR")}€</span>
                      </div>
                      {serviceFeeFixed > 0 && (
                        <div className="flex justify-between">
                          <span>Frais de traitement</span>
                          <span className="text-foreground font-medium">{serviceFeeFixed.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}€</span>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <span className="font-medium">{serviceFee.toLocaleString("fr-FR")}€</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-body">
              <span className="font-semibold">Total</span>
              <span className="font-display font-bold text-primary text-lg">{total.toLocaleString("fr-FR")}€</span>
            </div>
          </div>
        )}

        {/* CTA */}
        {!user && (
          <p className="font-body text-xs text-muted-foreground text-center">
            Vous devrez vous connecter pour confirmer la réservation.
          </p>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-coral text-white hover:opacity-90 font-body font-semibold h-12 text-base rounded-xl shadow-hero"
          size="lg"
        >
          {loading ? (
            "Redirection vers le paiement…"
          ) : nights > 0 ? (
            <span className="flex items-center gap-2 justify-center">
              <CreditCard className="w-4 h-4" />
              Payer {total.toLocaleString("fr-FR")} € via Stripe
            </span>
          ) : (
            "Réserver ce bien"
          )}
        </Button>

        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Shield className="w-4 h-4 text-primary" />
          <span className="font-body text-xs">Paiement sécurisé par Stripe · Annulation gratuite sous 48h</span>
        </div>
      </form>
    </Form>
  );
}
