-- Fix: messages.sender_id had no ON DELETE action, which blocked
-- auth user deletion even when messages would be cleaned up via
-- the conversations → messages cascade.
-- Adding ON DELETE CASCADE so deleting a user also removes their messages.

ALTER TABLE messages
  DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

ALTER TABLE messages
  ADD CONSTRAINT messages_sender_id_fkey
  FOREIGN KEY (sender_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;
