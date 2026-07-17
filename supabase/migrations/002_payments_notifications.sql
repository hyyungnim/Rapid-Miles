-- ============================================================
-- RAPID MILES — Payments, Notifications, Realtime
-- ============================================================

-- ─── Payments on bookings ────────────────────────────────────
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_status  TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending','paid','failed','refunded')),
  ADD COLUMN IF NOT EXISTS payment_ref     TEXT;

-- ─── Recipient info on bookings (collected in form, was missing) ──
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS recipient_name  TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS recipient_phone TEXT NOT NULL DEFAULT '';

-- ─── Notifications table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'info'
              CHECK (type IN ('info','booking','payment','tracking')),
  data        JSONB,
  read        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ─── Unique constraint for upsert on driver_locations ────────
-- Allows each driver to have only one location per booking
ALTER TABLE public.driver_locations
  ADD CONSTRAINT driver_locations_driver_booking_key
  UNIQUE (driver_id, booking_id);

-- ─── Realtime: enable broadcast for live tracking ────────────
-- Run in Supabase SQL Editor:
--   ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_locations;
--   ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
--   ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ─── Trigger: auto-notify on booking status change ───────────
CREATE OR REPLACE FUNCTION public.notify_booking_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Notify the customer
  INSERT INTO public.notifications (user_id, title, body, type, data)
  VALUES (
    NEW.user_id,
    CASE NEW.status
      WHEN 'accepted'      THEN 'Driver assigned'
      WHEN 'picked_up'     THEN 'Package picked up'
      WHEN 'in_transit'    THEN 'Package in transit'
      WHEN 'delivered'     THEN 'Package delivered!'
      WHEN 'cancelled'     THEN 'Booking cancelled'
      ELSE 'Status updated'
    END,
    CASE NEW.status
      WHEN 'accepted'      THEN 'Your rider is on the way to pick up your package.'
      WHEN 'picked_up'     THEN 'Your package has been collected and is on its way.'
      WHEN 'in_transit'    THEN 'Your package is being delivered.'
      WHEN 'delivered'     THEN 'Your package has been delivered successfully.'
      WHEN 'cancelled'     THEN 'Your booking has been cancelled.'
      ELSE 'Booking status changed to ' || NEW.status
    END,
    'booking',
    jsonb_build_object('tracking_number', NEW.tracking_number, 'status', NEW.status)
  );

  -- Notify the driver if assigned
  IF NEW.driver_id IS NOT NULL AND OLD.driver_id IS DISTINCT FROM NEW.driver_id THEN
    INSERT INTO public.notifications (user_id, title, body, type, data)
    VALUES (
      NEW.driver_id,
      'New delivery assignment',
      'You have been assigned to deliver ' || NEW.tracking_number || '.',
      'booking',
      jsonb_build_object('tracking_number', NEW.tracking_number, 'status', NEW.status)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_notify ON public.bookings;
CREATE TRIGGER bookings_notify
  AFTER INSERT OR UPDATE OF status, driver_id ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.notify_booking_status_change();
