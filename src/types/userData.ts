export interface UserData {
  age: number | null;
  sexe: "Homme" | "Femme" | "Autre" | null;
  taille_cm: number | null;
  poids_actuel_kg: number | null;
  poids_avant_arret_kg: number | null;
  alcool_types: string[];
  alcool_frequence: string | null;
  budget_alcool_hebdo_eur: number | null;
  sommeil_base: number | null;
  energie_base: number | null;
  frequence_cardiaque_repos: number | null;
  stress_base: number | null;
  objectif_jours_sans_alcool: number | null;
  objectifs_personnels: any;
  start_date: string | null;
}
