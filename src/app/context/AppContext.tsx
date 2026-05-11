import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, Hotel, Room, Destination, Booking, HotelWithRooms, RoomWithHotel, BookingWithDetails } from '../../lib/supabase';
import { useAuth } from './AuthContext';
import { mockIlocosHotels } from '../data/mockHotel';

interface AppContextType {
  destinations: Destination[];
  hotels: HotelWithRooms[];
  featuredHotels: HotelWithRooms[];
  rooms: RoomWithHotel[];
  bookings: BookingWithDetails[];
  loading: boolean;
  fetchDestinations: () => Promise<void>;
  fetchHotels: (destinationId?: string) => Promise<void>;
  fetchFeaturedHotels: () => Promise<void>;
  fetchRooms: (hotelId?: string) => Promise<void>;
  fetchBookings: () => Promise<void>;
  createBooking: (booking: Omit<Booking, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ error: Error | null }>;
  cancelBooking: (bookingId: string) => Promise<{ error: Error | null }>;
  searchHotels: (query: string, destination?: string) => Promise<HotelWithRooms[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [hotels, setHotels] = useState<HotelWithRooms[]>([]);
  const [featuredHotels, setFeaturedHotels] = useState<HotelWithRooms[]>([]);
  const [rooms, setRooms] = useState<RoomWithHotel[]>([]);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDestinations = async () => {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .order('name');
    
    if (!error && data) {
      setDestinations(data);
    }
  };

  const fetchHotels = async (destinationId?: string) => {
    let query = supabase
      .from('hotels')
      .select(`
        *,
        destination:destinations(*),
        rooms(*)
      `)
      .order('rating', { ascending: false });
    
    if (destinationId) {
      query = query.eq('destination_id', destinationId);
    }

    const { data, error } = await query;
    
    if (!error && data) {
      setHotels(data);
    }
  };

  const fetchFeaturedHotels = async () => {
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select(`*, destination:destinations(*), rooms(*)`)
        .eq('featured', true)
        .order('rating', { ascending: false })
        .limit(6);
      
      // If we got real data from Supabase, use it
      if (!error && data && data.length > 0) {
        setFeaturedHotels(data);
      } else {
        // FALLBACK: If Supabase has no data or fails, use our local Ilocos Norte hotels!
        setFeaturedHotels(mockIlocosHotels);
      }
    } catch (e) {
      // If there is no DB connection at all, still show the hotels
      setFeaturedHotels(mockIlocosHotels);
    }
  };

  const fetchRooms = async (hotelId?: string) => {
    let query = supabase
      .from('rooms')
      .select(`
        *,
        hotel:hotels(*)
      `)
      .eq('available', true)
      .order('price_per_night');
    
    if (hotelId) {
      query = query.eq('hotel_id', hotelId);
    }

    const { data, error } = await query;
    
    if (!error && data) {
      setRooms(data);
    }
  };

  const fetchBookings = async () => {
    if (!user) {
      setBookings([]);
      return;
    }

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        room:rooms(
          *,
          hotel:hotels(*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setBookings(data);
    }
  };

  const createBooking = async (booking: Omit<Booking, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      return { error: new Error('You must be logged in to make a booking') };
    }

    const { error } = await supabase
      .from('bookings')
      .insert({
        ...booking,
        user_id: user.id,
      });

    if (!error) {
      await fetchBookings();
    }

    return { error: error ? new Error(error.message) : null };
  };

  const cancelBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (!error) {
      await fetchBookings();
    }

    return { error: error ? new Error(error.message) : null };
  };

  const searchHotels = async (query: string, destination?: string): Promise<HotelWithRooms[]> => {
    let dbQuery = supabase
      .from('hotels')
      .select(`
        *,
        destination:destinations(*),
        rooms(*)
      `)
      .order('rating', { ascending: false });

    if (query) {

      dbQuery = dbQuery.or(`name.ilike."%${query}%",city.ilike."%${query}%",province.ilike."%${query}%"`);
    }

    if (destination) {
      dbQuery = dbQuery.eq('destination_id', destination);
    }

    const { data, error } = await dbQuery;
    
    if (error) {
      console.error('Search error:', error);
      return [];
    }
    
    return data || [];
  };

  // Initial data fetch
  // Initial data fetch
  useEffect(() => {
    let mounted = true;

    // THE FAILSAFE: If the database hangs for more than 3 seconds, force the UI to unlock!
    const emergencyUnlock = setTimeout(() => {
      if (mounted) {
        console.warn("Database took too long to respond. Unlocking UI.");
        setLoading(false);
      }
    }, 3000);

    const initData = async () => {
      try {
        await Promise.all([
          fetchDestinations(),
          fetchFeaturedHotels(),
          fetchRooms(),
        ]);
      } catch (error) {
        console.error('Error initializing app data:', error);
      } finally {
        clearTimeout(emergencyUnlock);
        if (mounted) setLoading(false);
      }
    };

    initData();

    return () => {
      mounted = false;
      clearTimeout(emergencyUnlock);
    };
  }, []);
  
  // Fetch bookings when user changes
  useEffect(() => {
    const loadBookings = async () => {
      if (user) {
        try {
          await fetchBookings();
        } catch (error) {
          console.error('Error fetching bookings:', error);
        }
      } else {
        setBookings([]);
      }
    };

    loadBookings();
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        destinations,
        hotels,
        featuredHotels,
        rooms,
        bookings,
        loading,
        fetchDestinations,
        fetchHotels,
        fetchFeaturedHotels,
        fetchRooms,
        fetchBookings,
        createBooking,
        cancelBooking,
        searchHotels,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
