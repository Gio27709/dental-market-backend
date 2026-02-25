ALTER TABLE professional_profiles 
ADD COLUMN IF NOT EXISTS license_image_url TEXT,
ADD COLUMN IF NOT EXISTS license_reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS license_review_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_professional_verified ON professional_profiles(is_verified);
