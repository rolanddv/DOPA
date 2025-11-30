import { UserData, DashboardStats } from "@/types/userData";

// Calories moyennes par type d'alcool (par verre standard)
const CALORIES_PAR_VERRE: Record<string, number> = {
  "Bière": 140,
  "Vin": 120,
  "Champagne": 95,
  "Spiritueux": 105,
  "Cocktails": 180,
};

// 1 kg de graisse = 7700 kcal
const CALORIES_PAR_KG = 7700;

// Estimation du nombre de verres par semaine selon la fréquence déclarée
const VERRES_PAR_SEMAINE: Record<string, number> = {
  "1–2 verres / semaine": 1.5,
  "3–6 verres / semaine": 4.5,
  "1 verre / jour": 7,
  "2–3 verres / jour": 17.5,
  "Plus de 3 verres / jour": 28,
};

/**
 * Calcule la progression cardiovasculaire basée sur les jours sans alcool
 * et la fréquence cardiaque au repos initiale
 */
function calculerProgressionCardio(
  jours: number,
  fcRepos?: number
): number {
  // Modèle de progression: amélioration rapide les 30 premiers jours, puis ralentissement
  if (!fcRepos) {
    // Sans FC de repos, on utilise un modèle général
    const progression = Math.min(100, jours * 1.5);
    return Math.round(progression);
  }

  // Avec FC de repos, on estime une réduction progressive
  // En moyenne -5 à -10 bpm après 3 mois d'arrêt
  const reductionBpmMax = 10;
  const joursMax = 90;
  const reductionEstimee = Math.min(
    reductionBpmMax,
    (jours / joursMax) * reductionBpmMax
  );
  const progressionPourcent = (reductionEstimee / reductionBpmMax) * 100;
  return Math.round(progressionPourcent);
}

/**
 * Calcule la progression du sommeil basée sur les jours sans alcool
 * et la qualité de sommeil initiale
 */
function calculerProgressionSommeil(jours: number, sommeilBase: number): number {
  // Le sommeil s'améliore rapidement les 2 premières semaines, puis se stabilise
  // Progression plus rapide si le sommeil de base était mauvais
  const potentielAmelioration = (5 - sommeilBase) / 4; // 0 à 1
  const progressionRapide = Math.min(50, jours * 3); // 50% en ~17 jours
  const progressionLente = Math.min(50, (jours - 17) * 1); // +50% sur les 50 jours suivants
  const progressionTotale = progressionRapide + Math.max(0, progressionLente);
  
  return Math.round(progressionTotale * potentielAmelioration);
}

/**
 * Hook personnalisé pour calculer toutes les statistiques du dashboard DOPA
 */
export function useDopaCalculations(
  userData: UserData | null,
  jours_sans_alcool: number
): DashboardStats | null {
  if (!userData) return null;

  // 1. Calcul des calories évitées
  const moyenneCalories =
    userData.alcool_types.reduce(
      (sum, type) => sum + (CALORIES_PAR_VERRE[type] || 0),
      0
    ) / userData.alcool_types.length;

  const verresSemaine = VERRES_PAR_SEMAINE[userData.alcool_frequence] || 0;
  const caloriesParSemaine = verresSemaine * moyenneCalories;
  const total_calories_evitees = Math.round(
    caloriesParSemaine * (jours_sans_alcool / 7)
  );

  // 2. Calcul du poids perdu estimé
  const poids_perdu_estime_kg = parseFloat(
    (total_calories_evitees / CALORIES_PAR_KG).toFixed(2)
  );

  // 3. Calcul des économies réalisées
  const economies_realisees_eur = Math.round(
    userData.budget_alcool_hebdo_eur * (jours_sans_alcool / 7)
  );

  // 4. Calculs santé & progression
  const progression_cardio = calculerProgressionCardio(
    jours_sans_alcool,
    userData.frequence_cardiaque_repos
  );

  const progression_sommeil = calculerProgressionSommeil(
    jours_sans_alcool,
    userData.sommeil_base
  );

  // Récupération du foie: estimation simple +0.3%/jour, max 100%
  const recuperation_foie = Math.min(100, Math.round(jours_sans_alcool * 0.3));

  // Régénération globale: moyenne des indicateurs normalisés
  const poidsNormalise = Math.min(100, poids_perdu_estime_kg * 20); // Hypothèse: 5kg = 100%
  const regeneration_globale = Math.round(
    (poidsNormalise +
      progression_cardio +
      progression_sommeil +
      recuperation_foie) /
      4
  );

  // 5. Calculs quotidiens et hebdomadaires
  const calories_evitees_par_jour = Math.round(caloriesParSemaine / 7);
  const joursCompletsCetteSemaine = Math.min(jours_sans_alcool, 7);
  const calories_evitees_cette_semaine = Math.round(
    caloriesParSemaine * (joursCompletsCetteSemaine / 7)
  );

  const economies_par_jour = Math.round(userData.budget_alcool_hebdo_eur / 7);
  const economies_cette_semaine = Math.round(
    userData.budget_alcool_hebdo_eur * (joursCompletsCetteSemaine / 7)
  );

  const verres_evites_total = Math.round(verresSemaine * (jours_sans_alcool / 7));
  const verres_evites_par_jour = parseFloat((verresSemaine / 7).toFixed(1));

  return {
    jours_sans_alcool,
    total_calories_evitees,
    poids_perdu_estime_kg,
    economies_realisees_eur,
    progression_cardio,
    progression_sommeil,
    recuperation_foie,
    regeneration_globale,
    calories_evitees_par_jour,
    calories_evitees_cette_semaine,
    economies_par_jour,
    economies_cette_semaine,
    verres_evites_total,
    verres_evites_par_jour,
  };
}
