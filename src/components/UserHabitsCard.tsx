import { Card } from "@/components/ui/card";
import { GlassWater, Calendar, Euro, Moon, Zap, HeartPulse } from "lucide-react";
import { UserData } from "@/types/userData";

interface UserHabitsCardProps {
  userData: UserData;
}

const ALCOOL_EMOJI: Record<string, string> = {
  "Bière": "🍺",
  "Vin": "🍷",
  "Champagne": "🥂",
  "Spiritueux": "🥃",
  "Cocktails": "🍹",
};

export const UserHabitsCard = ({ userData }: UserHabitsCardProps) => {
  return (
    <Card className="p-6 bg-gradient-to-br from-accent/20 to-accent/5">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <GlassWater className="h-5 w-5 text-primary" />
        Mes habitudes avant DOPA
      </h3>
      
      <div className="space-y-4">
        {/* Types d'alcool */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Types d'alcool consommés</p>
          <div className="flex flex-wrap gap-2">
            {userData.alcool_types.map((type, index) => (
              <div
                key={index}
                className="px-3 py-1.5 bg-background rounded-full text-sm font-medium flex items-center gap-1.5"
              >
                <span>{ALCOOL_EMOJI[type] || "🍸"}</span>
                <span>{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fréquence et budget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fréquence</p>
              <p className="text-sm font-medium">{userData.alcool_frequence}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Euro className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Budget hebdo</p>
              <p className="text-sm font-medium">{userData.budget_alcool_hebdo_eur}€/semaine</p>
            </div>
          </div>
        </div>

        {/* Indicateurs de base */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">État de santé initial</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 text-xs">
              <Moon className="h-4 w-4 text-purple-500" />
              <span>Sommeil: {userData.sommeil_base}/5</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Zap className="h-4 w-4 text-orange-500" />
              <span>Énergie: {userData.energie_base}/5</span>
            </div>
            {userData.frequence_cardiaque_repos && (
              <div className="flex items-center gap-2 text-xs">
                <HeartPulse className="h-4 w-4 text-red-500" />
                <span>FC: {userData.frequence_cardiaque_repos} bpm</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs">
              <span>😰</span>
              <span>Stress: {userData.stress_base}/5</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
