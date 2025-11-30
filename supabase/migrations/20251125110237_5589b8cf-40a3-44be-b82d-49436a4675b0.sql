-- Créer le bucket pour les photos utilisateurs
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-photos', 'user-photos', false);

-- Politique : les utilisateurs peuvent uploader leurs propres photos
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique : les utilisateurs peuvent voir leurs propres photos
CREATE POLICY "Users can view their own photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique : les utilisateurs peuvent supprimer leurs propres photos
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Créer la table des métadonnées des photos partagées
CREATE TABLE public.photo_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  file_path text NOT NULL,
  badge_emoji text,
  badge_text text,
  badge_category text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Activer RLS
ALTER TABLE public.photo_shares ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres photos
CREATE POLICY "Users can view their own photo shares"
ON public.photo_shares FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent insérer leurs propres photos
CREATE POLICY "Users can insert their own photo shares"
ON public.photo_shares FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres photos
CREATE POLICY "Users can delete their own photo shares"
ON public.photo_shares FOR DELETE
TO authenticated
USING (auth.uid() = user_id);