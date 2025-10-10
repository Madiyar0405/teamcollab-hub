-- Remove all policies causing infinite recursion
DROP POLICY IF EXISTS "Users can view participants of their chats" ON public.chat_participants;
DROP POLICY IF EXISTS "Authenticated users can add chat participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view their chats" ON public.chats;
DROP POLICY IF EXISTS "Chat participants can update their chats" ON public.chats;

-- Create simple SELECT policy for chat_participants without recursion
CREATE POLICY "Users can view all chat participants"
ON public.chat_participants
FOR SELECT
TO authenticated
USING (true);

-- Create simple INSERT policy for chat_participants
CREATE POLICY "Users can add chat participants"
ON public.chat_participants
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create simple SELECT policy for chats
CREATE POLICY "Users can view all chats"
ON public.chats
FOR SELECT
TO authenticated
USING (true);

-- Ensure UPDATE policy for chats exists
CREATE POLICY "Users can update chats"
ON public.chats
FOR UPDATE
TO authenticated
USING (true);