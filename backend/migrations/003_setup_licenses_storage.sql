INSERT INTO storage.buckets (id, name, public) 
VALUES ('licenses', 'licenses', false)
ON CONFLICT (id) DO NOTHING;

-- Solo Owner/Admin pueden leer licencias
CREATE POLICY "Admin can view licenses"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'licenses' 
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role_id IN (
      SELECT id FROM roles WHERE name IN ('owner', 'admin')
    )
  )
);

-- Solo el profesional puede subir su propia licencia
CREATE POLICY "Professional can upload own license"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'licenses' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
