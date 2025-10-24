-- Add status column to contacts table for request/accept flow
ALTER TABLE public.contacts 
ADD COLUMN status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected'));

-- Add index for better query performance
CREATE INDEX idx_contacts_status ON public.contacts(status);
CREATE INDEX idx_messages_read_at ON public.messages(receiver_id, read_at) WHERE read_at IS NULL;

-- Update RLS policies to handle pending/accepted states
DROP POLICY IF EXISTS "Users can view their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can add their own contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.contacts;

-- Users can view contacts they sent or received
CREATE POLICY "Users can view their own contacts and requests"
ON public.contacts
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = contact_id);

-- Users can add their own contacts (send requests)
CREATE POLICY "Users can send contact requests"
ON public.contacts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update contact status (accept/reject requests)
CREATE POLICY "Users can accept or reject requests"
ON public.contacts
FOR UPDATE
USING (auth.uid() = contact_id)
WITH CHECK (auth.uid() = contact_id);

-- Users can delete their own contacts
CREATE POLICY "Users can delete their own contacts"
ON public.contacts
FOR DELETE
USING (auth.uid() = user_id OR auth.uid() = contact_id);

-- Update messages RLS to only work with accepted contacts
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON public.messages;

CREATE POLICY "Users can view messages with accepted contacts"
ON public.messages
FOR SELECT
USING (
  (auth.uid() = sender_id OR auth.uid() = receiver_id) AND
  EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE status = 'accepted' 
    AND (
      (user_id = auth.uid() AND contact_id = (CASE WHEN sender_id = auth.uid() THEN receiver_id ELSE sender_id END))
      OR
      (contact_id = auth.uid() AND user_id = (CASE WHEN sender_id = auth.uid() THEN receiver_id ELSE sender_id END))
    )
  )
);