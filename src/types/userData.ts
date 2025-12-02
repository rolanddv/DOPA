export interface UserData {
  // Informations personnelles
  age: number;
  sexe: "Homme" | "Femme" | "Autre";
  taille_cm: number;
  poids_actuel_kg: number;
  poids_avant_arret_kg?: number;

  // Habitudes avant la maîtrise
  alcool_types: string[];
  alcool_frequence: string;
  budget_alcool_hebdo_eur: number;

  // État de santé initial
  sommeil_base: number; // 1-5
  energie_base: number; // 1-5
  frequence_cardiaque_repos?: number;
  stress_base: number; // 1-5

  // Objectifs
  objectif_jours_sans_alcool: number;
  objectifs_personnels: string[];

  // Date de début
  start_date: string;

  // Tâche d'urgence personnelle
  emergency_task_personal?: string;
}

export interface DashboardStats {
  jours_sans_alcool: number;
  total_calories_evitees: number;
  poids_perdu_estime_kg: number;
  economies_realisees_eur: number;
  progression_cardio: number;
  progression_sommeil: number;
  recuperation_foie: number;
  regeneration_globale: number;
  
  // Métriques quotidiennes et hebdomadaires
  calories_evitees_par_jour: number;
  calories_evitees_cette_semaine: number;
  economies_par_jour: number;
  economies_cette_semaine: number;
  verres_evites_total: number;
  verres_evites_par_jour: number;
}
