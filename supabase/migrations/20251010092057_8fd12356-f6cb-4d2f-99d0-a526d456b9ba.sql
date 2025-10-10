-- Fix profiles table RLS policy to restrict access to authenticated users only
-- This prevents anonymous users from harvesting email addresses and personal data

DROP POLICY IF EXISTS "Пользователи могут видеть все про" ON public.profiles;

CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Fix events table RLS policy to restrict access to authenticated users only
-- This prevents unauthenticated users from scraping business event data

DROP POLICY IF EXISTS "Все могут видеть события" ON public.events;

CREATE POLICY "Authenticated users can view all events"
ON public.events
FOR SELECT
TO authenticated
USING (true);