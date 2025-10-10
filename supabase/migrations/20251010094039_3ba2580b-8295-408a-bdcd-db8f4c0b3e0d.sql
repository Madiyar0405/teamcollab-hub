-- Remove old problematic policies that cause recursion and conflicts

DROP POLICY IF EXISTS "Участники видят участников своих" ON public.chat_participants;
DROP POLICY IF EXISTS "Пользователи могут создавать чаты" ON public.chats;

-- Ensure columns table has proper policies for admins/moderators
DROP POLICY IF EXISTS "Все могут видеть колонки" ON public.columns;

CREATE POLICY "Authenticated users can view columns"
ON public.columns
FOR SELECT
TO authenticated
USING (true);