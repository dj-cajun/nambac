-- Public buckets do not need a broad SELECT policy for object URL access.
-- Keeping one allows clients to list every object in the bucket.
DROP POLICY IF EXISTS "Khoe images public read" ON storage.objects;
