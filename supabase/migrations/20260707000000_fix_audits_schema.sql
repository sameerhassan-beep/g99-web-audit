-- Fix missing columns in the audits table
ALTER TABLE public.audits 
ADD COLUMN IF NOT EXISTS overall_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS screenshots JSONB,
ADD COLUMN IF NOT EXISTS sub_pages JSONB DEFAULT '[]'::jsonb;

-- Drop constraints on user_id so anonymous audits can be saved
ALTER TABLE public.audits DROP CONSTRAINT IF EXISTS audits_user_id_fkey;
ALTER TABLE public.audits ALTER COLUMN user_id DROP NOT NULL;

-- Ensure RLS is enabled
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Enable insert for all users" ON public.audits;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.audits;
DROP POLICY IF EXISTS "Enable update for all users" ON public.audits;

-- Re-create permissive policies for anonymous users (since the app currently doesn't use DB Auth)
CREATE POLICY "Enable insert for all users" ON public.audits
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON public.audits
    FOR SELECT USING (true);

CREATE POLICY "Enable update for all users" ON public.audits
    FOR UPDATE USING (true);
