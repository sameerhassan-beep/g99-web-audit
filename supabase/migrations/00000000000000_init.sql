-- G99 WebAudit Initial Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Audits Table
CREATE TABLE IF NOT EXISTS public.audits (
    id TEXT PRIMARY KEY, -- Using text because local storage currently uses Date.now().toString()
    user_id TEXT, -- For future Clerk integration
    url TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    overall_score INTEGER NOT NULL,
    report JSONB NOT NULL,
    screenshots JSONB,
    sub_pages JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

-- Policies for Audits Table
-- Allow anyone to read audits (or restrict to auth.uid() if using Supabase Auth)
-- Note: Since the app currently doesn't enforce DB auth, we allow public read/write for now, 
-- but you should change this when linking Auth!
CREATE POLICY "Enable read access for all users" ON public.audits
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.audits
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.audits
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON public.audits
    FOR DELETE USING (true);


-- Create Storage Bucket for Screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('screenshots', 'screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'screenshots' );

CREATE POLICY "Allow Uploads"
    ON storage.objects FOR INSERT
    WITH CHECK ( bucket_id = 'screenshots' );
