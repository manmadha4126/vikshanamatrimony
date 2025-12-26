-- Add indexes for high-volume profile queries

-- Index on profile_id for fast lookups (should be unique)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_profile_id ON public.profiles(profile_id) WHERE profile_id IS NOT NULL;

-- Index on email for fast lookups and uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Index on phone for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- Index on gender for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles(gender);

-- Index on verification_status for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON public.profiles(verification_status);

-- Index on created_at for sorting (descending for recent first)
CREATE INDEX IF NOT EXISTS idx_profiles_created_at_desc ON public.profiles(created_at DESC);

-- Index on is_complete for filtering complete registrations
CREATE INDEX IF NOT EXISTS idx_profiles_is_complete ON public.profiles(is_complete);

-- Composite index for common staff dashboard queries (verification + created_at)
CREATE INDEX IF NOT EXISTS idx_profiles_verification_created ON public.profiles(verification_status, created_at DESC);

-- Index on name for search operations (using text_pattern_ops for LIKE queries)
CREATE INDEX IF NOT EXISTS idx_profiles_name ON public.profiles(name text_pattern_ops);