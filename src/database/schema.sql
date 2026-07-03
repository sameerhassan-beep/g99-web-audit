-- Supabase Schema for AI Website Auditor

-- Create Users table (syncs with Clerk)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Audits table
CREATE TABLE public.audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id UUID UNIQUE REFERENCES public.audits(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL,
  category_scores JSONB NOT NULL,
  executive_summary JSONB NOT NULL,
  raw_results JSONB NOT NULL,
  screenshots JSONB NOT NULL, -- Paths or Base64 or signed URLs
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Users can only see their own data)
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid()::text = clerk_id);
CREATE POLICY "Users can view their own audits" ON public.audits FOR SELECT USING (
  user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text)
);
CREATE POLICY "Users can view their own reports" ON public.reports FOR SELECT USING (
  audit_id IN (SELECT id FROM public.audits WHERE user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.uid()::text))
);
