-- Add missing INSERT and UPDATE policies for chats table

CREATE POLICY "Authenticated users can create chats"
ON public.chats
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Chat participants can update their chats"
ON public.chats
FOR UPDATE
TO authenticated
USING (public.is_chat_participant(id, auth.uid()));

-- Fix chat_participants INSERT policy to allow creating new chats
-- The current policy prevents adding participants to new chats
DROP POLICY IF EXISTS "Users can add participants to their chats" ON public.chat_participants;

CREATE POLICY "Authenticated users can add chat participants"
ON public.chat_participants
FOR INSERT
TO authenticated
WITH CHECK (
  -- Either the user is already a participant (adding to existing chat)
  -- OR this is a new chat (no participants yet)
  public.is_chat_participant(chat_id, auth.uid()) 
  OR NOT EXISTS (
    SELECT 1 FROM public.chat_participants 
    WHERE chat_id = chat_participants.chat_id
  )
);