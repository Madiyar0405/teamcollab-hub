-- Remove the recursive policy from chat_participants
DROP POLICY IF EXISTS "Участники видят участников своих" ON public.chat_participants;