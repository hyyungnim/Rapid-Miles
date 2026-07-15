export type UserRole = "customer" | "driver" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export type BookingStatus =
  | "pending"
  | "accepted"
  | "rider_assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled";

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_address: string;
  lat: number;
  lng: number;
  is_favorite: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  driver_id: string | null;
  tracking_number: string;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  delivery_address: string;
  delivery_lat: number;
  delivery_lng: number;
  distance_km: number;
  duration_minutes: number;
  package_name: string;
  package_category: string;
  weight_kg: number;
  is_fragile: boolean;
  quantity: number;
  delivery_notes: string | null;
  delivery_fee: number;
  status: BookingStatus;
  route_geometry: string | null;
  created_at: string;
  updated_at: string;
}

export interface DriverLocation {
  id: string;
  driver_id: string;
  booking_id: string | null;
  lat: number;
  lng: number;
  heading: number | null;
  speed: number | null;
  updated_at: string;
}

export interface Driver {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  motorcycle_photo: string | null;
  rating: number;
  total_deliveries: number;
  is_online: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at">;
        Update: Partial<Omit<Profile, "id">>;
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Booking, "id">>;
      };
      addresses: {
        Row: Address;
        Insert: Omit<Address, "id" | "created_at">;
        Update: Partial<Omit<Address, "id">>;
      };
      driver_locations: {
        Row: DriverLocation;
        Insert: Omit<DriverLocation, "id" | "updated_at">;
        Update: Partial<Omit<DriverLocation, "id">>;
      };
      drivers: {
        Row: Driver;
        Insert: Omit<Driver, "created_at">;
        Update: Partial<Omit<Driver, "id">>;
      };
    };
  };
}
