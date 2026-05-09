import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables - using placeholder');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Database types
export interface Destination {
  id: string;
  name: string;
  region: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Hotel {
  id: string;
  name: string;
  description: string | null;
  destination_id: string | null;
  address: string | null;
  city: string;
  province: string;
  rating: number;
  review_count: number;
  amenities: string[];
  images: string[];
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  hotel_id: string;
  name: string;
  room_type: string;
  description: string | null;
  price_per_night: number;
  capacity: number;
  amenities: string[];
  images: string[];
  available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  special_requests: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  hotel_id: string;
  booking_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  hotel_id: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: 'customer' | 'admin';
  created_at: string;
  updated_at: string;
}

// Extended types with relations
export interface HotelWithRooms extends Hotel {
  rooms?: Room[];
  destination?: Destination;
}

export interface RoomWithHotel extends Room {
  hotel?: Hotel;
}

export interface BookingWithDetails extends Booking {
  room?: RoomWithHotel;
}
