-- Rendre le bucket user-photos public pour que les photos soient visibles par tous
UPDATE storage.buckets 
SET public = true 
WHERE id = 'user-photos';

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Anyone can view user photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;

-- Créer une politique pour permettre à tout le monde de voir les photos
CREATE POLICY "Anyone can view user photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-photos');

-- Politique pour permettre aux utilisateurs authentifiés d'uploader leurs propres photos
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique pour permettre aux utilisateurs de supprimer leurs propres photos
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);