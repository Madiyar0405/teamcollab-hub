-- Fix infinite recursion in chat_participants RLS policies
-- Create security definer function to avoid recursive policy checks

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Участники видят участников своих" ON public.chat_participants;
DROP POLICY IF EXISTS "Пользователи могут добавлять учас" ON public.chat_participants;
DROP POLICY IF EXISTS "Пользователи видят чаты где они уч" ON public.chats;

-- Create security definer function to check chat participation
CREATE OR REPLACE FUNCTION public.is_chat_participant(_chat_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_participants
    WHERE chat_id = _chat_id
      AND user_id = _user_id
  )
$$;

-- Fix chat_participants policies using the security definer function
CREATE POLICY "Users can view participants of their chats"
ON public.chat_participants
FOR SELECT
TO authenticated
USING (public.is_chat_participant(chat_id, auth.uid()));

CREATE POLICY "Users can add participants to their chats"
ON public.chat_participants
FOR INSERT
TO authenticated
WITH CHECK (public.is_chat_participant(chat_id, auth.uid()));

-- Fix chats table SELECT policy with correct logic
CREATE POLICY "Users can view their chats"
ON public.chats
FOR SELECT
TO authenticated
USING (public.is_chat_participant(id, auth.uid()));