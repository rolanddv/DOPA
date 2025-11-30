-- Drop existing user_data table and recreate with correct field names
DROP TABLE IF EXISTS public.user_data CASCADE;

-- Create user_data table with French field names as specified
CREATE TABLE public.user_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations personnelles
  age INTEGER NOT NULL,
  sexe TEXT NOT NULL,
  taille_cm INTEGER NOT NULL,
  poids_actuel_kg NUMERIC NOT NULL,
  poids_avant_arret_kg NUMERIC,
  
  -- Habitudes avant la maîtrise
  alcool_types TEXT[] NOT NULL,
  alcool_frequence TEXT NOT NULL,
  budget_alcool_hebdo_eur NUMERIC NOT NULL,
  
  -- État de santé initial
  sommeil_base INTEGER NOT NULL CHECK (sommeil_base >= 1 AND sommeil_base <= 5),
  energie_base INTEGER NOT NULL CHECK (energie_base >= 1 AND energie_base <= 5),
  frequence_cardiaque_repos INTEGER,
  stress_base INTEGER NOT NULL CHECK (stress_base >= 1 AND stress_base <= 5),
  
  -- Objectifs
  objectif_jours_sans_alcool INTEGER NOT NULL,
  objectifs_personnels TEXT[] NOT NULL,
  
  -- Date de début
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- Create policies for user_data
CREATE POLICY "Users can view their own data"
  ON public.user_data
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own data"
  ON public.user_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data"
  ON public.user_data
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_data_updated_at
  BEFORE UPDATE ON public.user_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();