-- supabase/migrations/20250502_fix_poi_rls.sql

-- 1) Enable RLS if it isn’t already
ALTER TABLE public.person_of_interest
ENABLE ROW LEVEL SECURITY;

-- 2) Remove any old, broken policies
DROP POLICY IF EXISTS insert_own_profile ON public.person_of_interest;
DROP POLICY IF EXISTS select_own_profile ON public.person_of_interest;
DROP POLICY IF EXISTS update_own_profile ON public.person_of_interest;

-- 3) Allow users to INSERT only rows they “own”
CREATE POLICY insert_own_profile
  ON public.person_of_interest
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- 4) Allow users to SELECT only their own row
CREATE POLICY select_own_profile
  ON public.person_of_interest
  FOR SELECT
  USING (auth.uid() = created_by);

-- 5) Allow users to UPDATE only their own row
CREATE POLICY update_own_profile
  ON public.person_of_interest
  FOR UPDATE
  USING (auth.uid() = created_by);
