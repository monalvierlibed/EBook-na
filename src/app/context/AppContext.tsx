import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, Hotel, Room, Destination, Booking, HotelWithRooms, RoomWithHotel, BookingWithDetails } from '../../lib/supabase';
import { useAuth } from './AuthContext';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { toast } from 'sonner';

export interface AppNotification {
  id: string;
  bookingId?: string;
  type: 'booking_confirmed' | 'booking_pending' | 'booking_cancelled' | 'booking_completed' | 'payment_reminder' | 'system';
  channel: 'in_app' | 'email';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  isNew: boolean;
}

interface AppContextType {
  destinations: Destination[];
  hotels: HotelWithRooms[];
  featuredHotels: HotelWithRooms[];
  rooms: RoomWithHotel[];
  bookings: BookingWithDetails[];
  notifications: AppNotification[];
  loading: boolean;
  fetchDestinations: () => Promise<void>;
  fetchHotels: (destinationId?: string) => Promise<void>;
  fetchFeaturedHotels: () => Promise<void>;
  fetchRooms: (hotelId?: string) => Promise<void>;
  fetchBookings: () => Promise<void>;
  createBooking: (booking: Omit<Booking, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ error: Error | null }>;
  cancelBooking: (bookingId: string) => Promise<{ error: Error | null }>;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<{ error: Error | null }>;
  createRoom: (room: Omit<Room, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error: Error | null }>;
  updateRoom: (roomId: string, updates: Partial<Room>) => Promise<{ error: Error | null }>;
  deleteRoom: (roomId: string) => Promise<{ error: Error | null }>;
  updateRoomAvailability: (roomId: string, available: boolean) => Promise<{ error: Error | null }>;
  updateRoomImages: (roomId: string, images: string[]) => Promise<{ error: Error | null }>;
  uploadRoomImages: (files: File[]) => Promise<{ urls: string[]; error: Error | null }>;
  searchHotels: (query: string, destination?: string) => Promise<HotelWithRooms[]>;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
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
  const { user, profile } = useAuth();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [hotels, setHotels] = useState<HotelWithRooms[]>([]);
  const [featuredHotels, setFeaturedHotels] = useState<HotelWithRooms[]>([]);
  const [rooms, setRooms] = useState<RoomWithHotel[]>([]);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const roomImagesBucket = import.meta.env.VITE_SUPABASE_ROOM_IMAGES_BUCKET || 'room-images';
  const isAdmin = (profile as { role?: string } | null)?.role === 'admin' ||
    user?.app_metadata?.role === 'admin' ||
    user?.user_metadata?.role === 'admin';

  const createStatusNotification = (
    booking: Booking,
    roomName?: string,
    opts?: { isNew?: boolean; channel?: 'in_app' | 'email' }
  ): AppNotification => {
    const status = booking.status;
    const safeRoomName = roomName || 'your selected room';
    const base = {
      id: `${booking.id}-${status}-${booking.updated_at || booking.created_at}-${opts?.channel || 'in_app'}`,
      bookingId: booking.id,
      createdAt: booking.updated_at || booking.created_at,
      isRead: false,
      isNew: opts?.isNew ?? true,
      channel: opts?.channel || 'in_app',
    } as const;

    if (status === 'confirmed') {
      return {
        ...base,
        type: 'booking_confirmed',
        title: 'Booking Confirmed',
        message: `Your booking for ${safeRoomName} is confirmed.`,
      };
    }

    if (status === 'cancelled') {
      return {
        ...base,
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        message: `Your booking for ${safeRoomName} was cancelled.`,
      };
    }

    if (status === 'completed') {
      return {
        ...base,
        type: 'booking_completed',
        title: 'Stay Completed',
        message: `Your stay for ${safeRoomName} is marked completed.`,
      };
    }

    return {
      ...base,
      type: 'booking_pending',
      title: 'Booking Pending',
      message: `Your booking for ${safeRoomName} is awaiting confirmation.`,
    };
  };

  const appendUniqueNotification = (notification: AppNotification) => {
    setNotifications((prev) => {
      if (prev.some((item) => item.id === notification.id)) {
        return prev;
      }
      return [notification, ...prev].slice(0, 100);
    });
  };

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
    const { data, error } = await supabase
      .from('hotels')
      .select(`
        *,
        destination:destinations(*),
        rooms(*)
      `)
      .eq('featured', true)
      .order('rating', { ascending: false })
      .limit(6);
    
    if (!error && data) {
      setFeaturedHotels(data);
    }
  };

  const fetchRooms = async (hotelId?: string) => {
    let query = supabase
      .from('rooms')
      .select(`
        *,
        hotel:hotels(*)
      `)
      .order('price_per_night');

    if (!isAdmin) {
      query = query.eq('available', true);
    }
    
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

    let query = supabase
      .from('bookings')
      .select(`
        *,
        room:rooms(
          *,
          hotel:hotels(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query;
    
    if (!error && data) {
      setBookings(data);
      if (data.length > 0) {
        const seeded = data.map((booking) =>
          createStatusNotification(booking, booking.room?.name, { isNew: false })
        );
        setNotifications((prev) => {
          const next = [...prev];
          seeded.forEach((item) => {
            if (!next.some((existing) => existing.id === item.id)) {
              next.push(item);
            }
          });
          return next
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 100);
        });
      }
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

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (!error) {
      await fetchBookings();
    }

    return { error: error ? new Error(error.message) : null };
  };

  const createRoom = async (room: Omit<Room, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase.from('rooms').insert(room);
    if (!error) {
      await fetchRooms();
    }
    return { error: error ? new Error(error.message) : null };
  };

  const updateRoom = async (roomId: string, updates: Partial<Room>) => {
    const { error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', roomId);
    if (!error) {
      await fetchRooms();
    }
    return { error: error ? new Error(error.message) : null };
  };

  const deleteRoom = async (roomId: string) => {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId);
    if (!error) {
      await fetchRooms();
    }
    return { error: error ? new Error(error.message) : null };
  };

  const updateRoomAvailability = async (roomId: string, available: boolean) => {
    return updateRoom(roomId, { available });
  };

  const updateRoomImages = async (roomId: string, images: string[]) => {
    return updateRoom(roomId, { images });
  };

  const uploadRoomImages = async (files: File[]) => {
    if (files.length === 0) {
      return { urls: [], error: null };
    }

    try {
      const uploads = files.map(async (file) => {
        const safeName = file.name.replace(/\s+/g, '-').toLowerCase();
        const objectPath = `${user?.id || 'anonymous'}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from(roomImagesBucket)
          .upload(objectPath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage.from(roomImagesBucket).getPublicUrl(objectPath);
        return data.publicUrl;
      });

      const urls = await Promise.all(uploads);
      return { urls, error: null };
    } catch (error) {
      return {
        urls: [],
        error: error instanceof Error ? error : new Error('Failed to upload room images'),
      };
    }
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
      dbQuery = dbQuery.or(`name.ilike.%${query}%,city.ilike.%${query}%,province.ilike.%${query}%`);
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

  const markNotificationRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notificationId ? { ...item, isRead: true, isNew: false } : item
      )
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true, isNew: false })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Initial data fetch
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDestinations(),
        fetchFeaturedHotels(),
        fetchRooms(),
      ]);
      setLoading(false);
    };

    initData();
  }, []);

  // Fetch bookings when user changes
  useEffect(() => {
    if (user) {
      fetchBookings();
    } else {
      setBookings([]);
      setNotifications([]);
    }
  }, [user, profile]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`booking-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload: RealtimePostgresChangesPayload<Booking>) => {
          const bookingRow = (payload.new || payload.old) as Booking | undefined;
          if (!bookingRow) return;

          await fetchBookings();

          const inAppNotification = createStatusNotification(bookingRow, undefined, { isNew: true });
          appendUniqueNotification(inAppNotification);

          if (bookingRow.status === 'confirmed') {
            const emailNotification = createStatusNotification(bookingRow, undefined, {
              isNew: true,
              channel: 'email',
            });
            appendUniqueNotification({
              ...emailNotification,
              title: 'Confirmation Email Sent',
              message: 'A confirmation email was sent for your booking.',
            });
          }

          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            toast.success(inAppNotification.title, {
              description: inAppNotification.message,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        destinations,
        hotels,
        featuredHotels,
        rooms,
        bookings,
        notifications,
        loading,
        fetchDestinations,
        fetchHotels,
        fetchFeaturedHotels,
        fetchRooms,
        fetchBookings,
        createBooking,
        cancelBooking,
        updateBookingStatus,
        createRoom,
        updateRoom,
        deleteRoom,
        updateRoomAvailability,
        updateRoomImages,
        uploadRoomImages,
        searchHotels,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
