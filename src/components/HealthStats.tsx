import { Card } from "@/components/ui/card";
import { Activity, TrendingUp, Euro, Heart, Moon, Droplet, Calendar, Wine } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserData } from "@/types/userData";
import { useDopaCalculations } from "@/hooks/useDopaCalculations";

interface HealthStatsProps {
  days: number;
}

export const HealthStats = ({ days }: HealthStatsProps) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("user_data")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUserData({
          age: data.age,
          sexe: data.sexe as "Homme" | "Femme" | "Autre",
          taille_cm: data.taille_cm,
          poids_actuel_kg: data.poids_actuel_kg,
          poids_avant_arret_kg: data.poids_avant_arret_kg,
          alcool_types: data.alcool_types,
          alcool_frequence: data.alcool_frequence,
          budget_alcool_hebdo_eur: data.budget_alcool_hebdo_eur,
          sommeil_base: data.sommeil_base,
          energie_base: data.energie_base,
          frequence_cardiaque_repos: data.frequence_cardiaque_repos,
          stress_base: data.stress_base,
          objectif_jours_sans_alcool: data.objectif_jours_sans_alcool,
          objectifs_personnels: data.objectifs_personnels,
          start_date: data.start_date,
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useDopaCalculations(userData, days);

  if (loading || !stats) {
    return (
      <div className="text-center text-muted-foreground">
        Chargement de vos statistiques...
      </div>
    );
  }

  const statsData = [
    {
      icon: TrendingUp,
      label: "Poids perdu estimé",
      value: `${stats.poids_perdu_estime_kg} kg`,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Euro,
      label: "Économies totales",
      value: `${stats.economies_realisees_eur} €`,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      icon: Wine,
      label: "Verres évités",
      value: `${stats.verres_evites_total} verres`,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Activity,
      label: "Calories évitées",
      value: `${stats.total_calories_evitees.toLocaleString()} kcal`,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
  ];

  const progressStats = [
    {
      icon: Heart,
      label: "Progression cardio",
      value: stats.progression_cardio,
      color: "text-red-500",
    },
    {
      icon: Moon,
      label: "Amélioration sommeil",
      value: stats.progression_sommeil,
      color: "text-purple-500",
    },
    {
      icon: Droplet,
      label: "Récupération foie",
      value: stats.recuperation_foie,
      color: "text-cyan-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Régénération globale */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Régénération globale
          </h3>
          <div className="relative">
            <div className="text-5xl font-bold text-primary">
              {stats.regeneration_globale}%
            </div>
            <Progress
              value={stats.regeneration_globale}
              className="mt-4 h-3"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Votre progression générale depuis le début
          </p>
        </div>
      </Card>

      {/* Métriques quotidiennes */}
      <Card className="p-6 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Aujourd'hui
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">~{stats.calories_evitees_par_jour}</p>
            <p className="text-xs text-muted-foreground mt-1">kcal évitées</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-500">~{stats.economies_par_jour}€</p>
            <p className="text-xs text-muted-foreground mt-1">économisés</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-500">~{stats.verres_evites_par_jour}</p>
            <p className="text-xs text-muted-foreground mt-1">verre évité</p>
          </div>
        </div>
      </Card>

      {/* Métriques hebdomadaires */}
      <Card className="p-6 bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Wine className="h-5 w-5 text-green-500" />
          Cette semaine
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">{stats.calories_evitees_cette_semaine}</p>
            <p className="text-xs text-muted-foreground mt-1">kcal évitées</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-500">{stats.economies_cette_semaine}€</p>
            <p className="text-xs text-muted-foreground mt-1">économisés</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-500">{Math.min(stats.verres_evites_total, Math.round(stats.verres_evites_par_jour * 7))}</p>
            <p className="text-xs text-muted-foreground mt-1">verres évités</p>
          </div>
        </div>
      </Card>

      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statsData.map((stat, index) => (
          <Card
            key={index}
            className="p-6 hover:shadow-lg transition-shadow animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Progression santé */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">
          Progrès santé
        </h3>
        <div className="space-y-6">
          {progressStats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-sm font-medium text-foreground">
                    {stat.label}
                  </span>
                </div>
                <span className={`text-sm font-bold ${stat.color}`}>
                  {stat.value}%
                </span>
              </div>
              <Progress value={stat.value} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      {/* Message d'objectif */}
      {userData && (
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Objectif : {userData.objectif_jours_sans_alcool} jours
            </p>
            <div className="flex justify-center items-center gap-2">
              <Progress
                value={
                  (days / userData.objectif_jours_sans_alcool) * 100
                }
                className="h-2 flex-1 max-w-md"
              />
              <span className="text-sm font-medium text-primary">
                {Math.min(
                  100,
                  Math.round(
                    (days / userData.objectif_jours_sans_alcool) * 100
                  )
                )}
                %
              </span>
            </div>
            {days >= userData.objectif_jours_sans_alcool && (
              <p className="text-sm font-bold text-primary mt-2">
                🎉 Objectif atteint ! Félicitations !
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
