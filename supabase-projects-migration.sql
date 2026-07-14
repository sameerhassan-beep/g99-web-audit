-- 1. Create Projects Table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  clarity_api_token TEXT,
  clarity_project_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add project_id to Audits
ALTER TABLE public.audits 
ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

-- 3. Enable RLS on Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for Projects
CREATE POLICY "Users can view their own projects" ON public.projects 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON public.projects 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON public.projects 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON public.projects 
FOR DELETE USING (auth.uid() = user_id);
