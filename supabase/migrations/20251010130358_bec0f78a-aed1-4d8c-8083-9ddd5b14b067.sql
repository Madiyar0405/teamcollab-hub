-- Remove policies causing recursion on chat_messages
DROP POLICY IF EXISTS "Участники чата могут видеть сообщ" ON public.chat_messages;
DROP POLICY IF EXISTS "Участники могут отправлять сообще" ON public.chat_messages;

-- Create simple policies without joins
CREATE POLICY "Users can view all messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can send messages"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());