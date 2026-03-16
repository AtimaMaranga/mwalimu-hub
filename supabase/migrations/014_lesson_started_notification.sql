-- Add lesson_started to notification types
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'booking_created', 'booking_confirmed', 'booking_declined',
    'booking_cancelled', 'new_message', 'lesson_reminder',
    'lesson_started'
  ));
