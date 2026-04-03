import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Save, Settings2, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Setting {
  id: string;
  key: string;
  value: string;
  label: string | null;
  description: string | null;
  category: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  finance:      "Finance & Commissions",
  cancellation: "Politique d'annulation",
  general:      "Paramètres généraux",
};

const CATEGORY_ORDER = ["finance", "cancellation", "general"];

export default function AdminSettings() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["admin-platform-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings" as "platform_settings")
        .select("*")
        .order("category")
        .order("key");
      if (error) throw error;
      return data as Setting[];
    },
  });

  // Sync fetched settings into local state
  useEffect(() => {
    const map: Record<string, string> = {};
    settings.forEach((s) => { map[s.key] = s.value; });
    setValues(map);
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (setting: Setting) => {
      const { error } = await supabase
        .from("platform_settings" as "platform_settings")
        .update({ value: values[setting.key], updated_at: new Date().toISOString() })
        .eq("key", setting.key);
      if (error) throw error;
    },
    onSuccess: (_, setting) => {
      qc.invalidateQueries({ queryKey: ["admin-platform-settings"] });
      setSaved((prev) => ({ ...prev, [setting.key]: true }));
      setTimeout(() => setSaved((prev) => { const n = { ...prev }; delete n[setting.key]; return n; }), 2000);
    },
    onError: () => toast({ title: "Erreur de sauvegarde", variant: "destructive" }),
  });

  const saveAll = async () => {
    for (const s of settings) {
      if (values[s.key] !== s.value) {
        await saveMutation.mutateAsync(s);
      }
    }
    toast({ title: "Tous les paramètres sauvegardés" });
  };

  const grouped = CATEGORY_ORDER.reduce<Record<string, Setting[]>>((acc, cat) => {
    acc[cat] = settings.filter((s) => s.category === cat);
    return acc;
  }, {});

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-3xl">

      <div className="flex items-center justify-between">
        <p className="font-body text-sm text-muted-foreground">
          Configurez les paramètres globaux de la plateforme Residotel.
        </p>
        <Button onClick={saveAll} disabled={saveMutation.isPending} className="gap-2">
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Tout sauvegarder
        </Button>
      </div>

      {CATEGORY_ORDER.map((cat) => {
        const items = grouped[cat] ?? [];
        if (!items.length) return null;
        return (
          <div key={cat} className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2 bg-muted/30">
              <Settings2 className="w-4 h-4 text-primary" />
              <h3 className="font-display font-semibold text-foreground">{CATEGORY_LABELS[cat] ?? cat}</h3>
            </div>
            <div className="divide-y divide-border">
              {items.map((s) => (
                <div key={s.key} className="px-5 py-4 flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-[180px]">
                    <p className="font-body text-sm font-semibold text-foreground">{s.label ?? s.key}</p>
                    {s.description && (
                      <p className="font-body text-xs text-muted-foreground mt-0.5">{s.description}</p>
                    )}
                    <p className="font-body text-[10px] text-muted-foreground/50 mt-0.5 font-mono">{s.key}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={values[s.key] ?? ""}
                      onChange={(e) => setValues((prev) => ({ ...prev, [s.key]: e.target.value }))}
                      className="w-40 font-body text-sm h-9"
                    />
                    <Button
                      size="sm"
                      variant={saved[s.key] ? "outline" : "default"}
                      className="h-9 gap-1.5 min-w-[80px]"
                      onClick={() => saveMutation.mutate(s)}
                      disabled={saveMutation.isPending || values[s.key] === s.value}
                    >
                      {saved[s.key] ? (
                        <><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Sauvegardé</>
                      ) : (
                        <><Save className="w-3.5 h-3.5" /> Sauver</>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
