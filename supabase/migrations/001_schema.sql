-- ============================================================
-- RAPID MILES LOGISTICS — Full Database Schema
-- Run this in Supabase SQL Editor (all at once)
-- ============================================================

-- ─── Enums ───────────────────────────────────────────────────

CREATE TYPE public.user_role AS ENUM ('customer', 'driver', 'admin');

CREATE TYPE public.booking_status AS ENUM (
  'pending',
  'accepted',
  'rider_assigned',
  'picked_up',
  'in_transit',
  'delivered',
  'cancelled'
);

-- ─── Tables ──────────────────────────────────────────────────

-- 1. Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT NOT NULL DEFAULT '',
  phone       TEXT,
  role        public.user_role NOT NULL DEFAULT 'customer',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Drivers (directory / extended profile)
CREATE TABLE public.drivers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name         TEXT NOT NULL,
  phone             TEXT NOT NULL,
  email             TEXT NOT NULL,
  motorcycle_photo  TEXT,
  rating            DOUBLE PRECISION NOT NULL DEFAULT 5.0,
  total_deliveries  INTEGER NOT NULL DEFAULT 0,
  is_online         BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Bookings
CREATE TABLE public.bookings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  driver_id         UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  tracking_number   TEXT NOT NULL UNIQUE,
  pickup_address    TEXT NOT NULL,
  pickup_lat        DOUBLE PRECISION NOT NULL,
  pickup_lng        DOUBLE PRECISION NOT NULL,
  delivery_address  TEXT NOT NULL,
  delivery_lat      DOUBLE PRECISION NOT NULL,
  delivery_lng      DOUBLE PRECISION NOT NULL,
  distance_km       DOUBLE PRECISION NOT NULL,
  duration_minutes  INTEGER NOT NULL,
  package_name      TEXT NOT NULL,
  package_category  TEXT NOT NULL DEFAULT 'Other',
  weight_kg         DOUBLE PRECISION NOT NULL DEFAULT 1,
  is_fragile        BOOLEAN NOT NULL DEFAULT false,
  quantity          INTEGER NOT NULL DEFAULT 1,
  delivery_notes    TEXT,
  delivery_fee      INTEGER NOT NULL,
  status            public.booking_status NOT NULL DEFAULT 'pending',
  route_geometry    JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Addresses (saved addresses for customers)
CREATE TABLE public.addresses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label         TEXT NOT NULL,
  full_address  TEXT NOT NULL,
  lat           DOUBLE PRECISION NOT NULL,
  lng           DOUBLE PRECISION NOT NULL,
  is_favorite   BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Driver locations (real-time GPS)
CREATE TABLE public.driver_locations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id   UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  booking_id  UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  heading     DOUBLE PRECISION,
  speed       DOUBLE PRECISION,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Indexes ─────────────────────────────────────────────────

CREATE INDEX idx_bookings_user_id       ON public.bookings(user_id);
CREATE INDEX idx_bookings_driver_id     ON public.bookings(driver_id);
CREATE INDEX idx_bookings_status        ON public.bookings(status);
CREATE INDEX idx_bookings_tracking      ON public.bookings(tracking_number);
CREATE INDEX idx_bookings_created_at    ON public.bookings(created_at DESC);
CREATE INDEX idx_addresses_user_id      ON public.addresses(user_id);
CREATE INDEX idx_driver_locations_driver ON public.driver_locations(driver_id);
CREATE INDEX idx_driver_locations_booking ON public.driver_locations(booking_id);

-- ─── Trigger: auto-create profile on auth signup ────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', NULL),
    'customer'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Trigger: updated_at on bookings ────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Trigger: updated_at on driver_locations ────────────────

CREATE OR REPLACE TRIGGER driver_locations_updated_at
  BEFORE UPDATE ON public.driver_locations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Row Level Security ──────────────────────────────────────

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_locations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers           ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Bookings
CREATE POLICY "Customers can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Drivers can view assigned bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = driver_id);

CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Customers can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Drivers can update assigned bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = driver_id AND driver_id IS NOT NULL);

CREATE POLICY "Admins can update any booking"
  ON public.bookings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Addresses
CREATE POLICY "Users can manage own addresses"
  ON public.addresses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all addresses"
  ON public.addresses FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Driver locations
CREATE POLICY "Anyone can view driver locations"
  ON public.driver_locations FOR SELECT
  USING (true);

CREATE POLICY "Drivers can manage own location"
  ON public.driver_locations FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.drivers WHERE id = auth.uid()))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.drivers WHERE id = auth.uid()));

CREATE POLICY "Admins can manage all locations"
  ON public.driver_locations FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Drivers
CREATE POLICY "Anyone can view drivers"
  ON public.drivers FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage drivers"
  ON public.drivers FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ─── Seed: default admin (run AFTER creating the user in Auth) ──
-- Replace the UUID below with your admin user's auth.uid() after signup.
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@rapidmiles.com';
