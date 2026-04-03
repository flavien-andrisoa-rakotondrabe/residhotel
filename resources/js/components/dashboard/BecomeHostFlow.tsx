import { useState } from "react";
import {
  Home, Calendar, CreditCard, CheckCircle2, ArrowRight, ArrowLeft,
  Upload, Euro, Shield, Star, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const steps = [
  {
    id: 1,
    icon: Home,
    title: "Votre logement",
    desc: "Informations de base sur le bien que vous souhaitez proposer.",
  },
  {
    id: 2,
    icon: Calendar,
    title: "Disponibilités",
    desc: "Définissez vos premières disponibilités.",
  },
  {
    id: 3,
    icon: Euro,
    title: "Tarification",
    desc: "Configurez votre prix par nuit.",
  },
  {
    id: 4,
    icon: CreditCard,
    title: "Paiements",
    desc: "Ajoutez vos informations de paiement pour recevoir vos revenus.",
  },
];

const benefits = [
  { icon: Euro, text: "Gagnez des revenus supplémentaires" },
  { icon: Shield, text: "Paiements sécurisés et garantis" },
  { icon: Star, text: "Assistance hôte 24h/24" },
  { icon: Sparkles, text: "Tableau de bord dédié" },
];

interface Props {
  onSuccess?: () => void;
}

export default function BecomeHostFlow({ onSuccess }: Props) {
  const { activateHostRole } = useAuth();
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    setLoading(true);
    const { error } = await activateHostRole();
    setLoading(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "🎉 Rôle hôte activé !", description: "Bienvenue dans l'espace hôte Residotel." });
      onSuccess?.();
    }
  };

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 text-center text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/20" />
            <div className="absolute bottom-4 left-4 w-20 h-20 rounded-full bg-white/10" />
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-amber flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Home className="w-8 h-8 text-white" />
            </div>
            <h2 className="font-display text-3xl font-bold mb-2">Devenez hôte Residotel</h2>
            <p className="font-body text-primary-foreground/80 max-w-md mx-auto text-sm leading-relaxed">
              Proposez votre logement et rejoignez des milliers d'hôtes qui génèrent des revenus supplémentaires sur Residotel.
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 gap-4">
          {benefits.map((b) => (
            <div key={b.text} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                <b.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="font-body text-sm font-medium text-foreground">{b.text}</p>
            </div>
          ))}
        </div>

        {/* Steps preview */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Comment ça marche ?</h3>
          <div className="space-y-4">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-sm shrink-0">
                    {s.id}
                  </div>
                  {i < steps.length - 1 && <div className="w-px h-6 bg-border mt-1" />}
                </div>
                <div className="pt-1">
                  <p className="font-body font-semibold text-foreground text-sm">{s.title}</p>
                  <p className="font-body text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={() => setStarted(true)}
          className="w-full bg-gradient-amber text-white hover:opacity-90 font-body font-semibold h-12 text-base rounded-xl gap-2"
          size="lg"
        >
          Commencer l'inscription hôte
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-bold text-foreground">Inscription hôte</h2>
          <span className="font-body text-sm text-muted-foreground">Étape {step} / {steps.length}</span>
        </div>
        <div className="flex gap-1.5">
          {steps.map((s) => (
            <div
              key={s.id}
              className={`flex-1 h-1.5 rounded-full transition-all ${s.id <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Home className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Votre logement</h3>
                <p className="font-body text-xs text-muted-foreground">Informations de base</p>
              </div>
            </div>
            <div>
              <Label className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">Titre de l'annonce</Label>
              <Input placeholder="Ex: Villa avec piscine vue mer" className="mt-1.5 font-body h-11" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type de bien</Label>
                <select className="mt-1.5 w-full h-11 rounded-xl border border-input bg-background px-3 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <option>Villa</option>
                  <option>Appartement</option>
                  <option>Studio</option>
                  <option>Maison</option>
                  <option>Chalet</option>
                </select>
              </div>
              <div>
                <Label className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ville</Label>
                <Input placeholder="Ex: Paris" className="mt-1.5 font-body h-11" />
              </div>
            </div>
            <div>
              <Label className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">Photos</Label>
              <div className="mt-1.5 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="font-body text-sm text-muted-foreground">Glissez vos photos ici ou <span className="text-primary font-semibold">parcourir</span></p>
                <p className="font-body text-xs text-muted-foreground mt-1">PNG, JPG jusqu'à 10 Mo</p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Disponibilités</h3>
                <p className="font-body text-xs text-muted-foreground">Quand votre bien est-il disponible ?</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">Disponible dès le</Label>
                <Input type="date" className="mt-1.5 font-body h-11" />
              </div>
              <div>
                <Label className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">Durée min. (nuits)</Label>
                <Input type="number" placeholder="2" min="1" className="mt-1.5 font-body h-11" />
              </div>
            </div>
            <div>
              <Label className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">Délai d'annulation</Label>
              <select className="mt-1.5 w-full h-11 rounded-xl border border-input bg-background px-3 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Flexible (annulation gratuite 7j avant)</option>
                <option>Modéré (annulation gratuite 5j avant)</option>
                <option>Strict (50% remboursé 14j avant)</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Euro className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Tarification</h3>
                <p className="font-body text-xs text-muted-foreground">Définissez votre prix</p>
              </div>
            </div>
            <div>
              <Label className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">Prix par nuit (€)</Label>
              <div className="relative mt-1.5">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="number" placeholder="150" className="pl-9 font-body h-11" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">Frais de nettoyage (€)</Label>
                <Input type="number" placeholder="50" className="mt-1.5 font-body h-11" />
              </div>
              <div>
                <Label className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">Caution (€)</Label>
                <Input type="number" placeholder="500" className="mt-1.5 font-body h-11" />
              </div>
            </div>
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
              <p className="font-body text-xs text-muted-foreground">
                💡 Les hôtes Residotel gagnent en moyenne <span className="font-semibold text-primary">3 200 € / mois</span>. 
                Residotel prend une commission de 3% par réservation.
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Informations de paiement</h3>
                <p className="font-body text-xs text-muted-foreground">Pour recevoir vos revenus</p>
              </div>
            </div>
            <div>
              <Label className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">IBAN</Label>
              <Input placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX" className="mt-1.5 font-body h-11" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">Titulaire</Label>
                <Input placeholder="Jean Dupont" className="mt-1.5 font-body h-11" />
              </div>
              <div>
                <Label className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">BIC / SWIFT</Label>
                <Input placeholder="BNPAFRPP" className="mt-1.5 font-body h-11" />
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3">
              <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="font-body text-xs text-primary/80">
                Vos informations bancaires sont chiffrées et sécurisées. Residotel ne débite jamais votre compte — seuls les virements entrants sont effectués.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            className="font-body gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
        )}
        {step < steps.length ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            className="flex-1 bg-gradient-brand text-primary-foreground hover:opacity-90 font-body font-semibold gap-2"
          >
            Continuer
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleActivate}
            disabled={loading}
            className="flex-1 bg-gradient-amber text-white hover:opacity-90 font-body font-semibold gap-2 h-12"
          >
            {loading ? "Activation..." : "Activer mon espace hôte"}
            {!loading && <CheckCircle2 className="w-5 h-5" />}
          </Button>
        )}
      </div>
    </div>
  );
}
