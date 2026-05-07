import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

interface Room {
  id: string;
  hotelId: string;
  hotelName: string;
  name: string;
  type: string;
  price: number;
  rating: number;
  image: string;
  description: string;
  amenities: string[];
  location: string;
  available: boolean;
}

interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'approved' | 'cancelled';
  createdAt: string;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  rooms: Room[];
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  updateBookingStatus: (bookingId: string, status: 'pending' | 'approved' | 'cancelled') => void;
  updateRoomAvailability: (roomId: string, available: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

const mockRooms: Room[] = [
  {
    id: '1',
    hotelId: 'h1',
    hotelName: 'Azure Bay Resort',
    name: 'Deluxe Ocean View',
    type: 'Deluxe',
    price: 250,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    description: 'Spacious room with stunning ocean views, king-size bed, and modern amenities.',
    amenities: ['Free WiFi', 'Ocean View', 'King Bed', 'Mini Bar', 'Room Service'],
    location: 'Miami Beach, FL',
    available: true,
  },
  {
    id: '2',
    hotelId: 'h2',
    hotelName: 'Mountain Peak Lodge',
    name: 'Premium Suite',
    type: 'Suite',
    price: 350,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
    description: 'Luxurious suite with mountain views, separate living area, and premium furnishings.',
    amenities: ['Free WiFi', 'Mountain View', 'Fireplace', 'Balcony', 'Spa Access'],
    location: 'Aspen, CO',
    available: true,
  },
  {
    id: '3',
    hotelId: 'h3',
    hotelName: 'Urban Central Hotel',
    name: 'Standard City Room',
    type: 'Standard',
    price: 150,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
    description: 'Comfortable city room with modern decor and convenient downtown location.',
    amenities: ['Free WiFi', 'City View', 'Queen Bed', 'Work Desk', 'Breakfast'],
    location: 'New York, NY',
    available: true,
  },
  {
    id: '4',
    hotelId: 'h4',
    hotelName: 'Sunset Paradise Resort',
    name: 'Beachfront Villa',
    type: 'Villa',
    price: 500,
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    description: 'Private villa with direct beach access, private pool, and exclusive services.',
    amenities: ['Private Pool', 'Beach Access', 'Butler Service', 'Kitchen', 'Terrace'],
    location: 'Malibu, CA',
    available: true,
  },
  {
    id: '5',
    hotelId: 'h5',
    hotelName: 'Downtown Business Hotel',
    name: 'Executive Room',
    type: 'Executive',
    price: 200,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
    description: 'Business-friendly room with ergonomic workspace and premium amenities.',
    amenities: ['Free WiFi', 'Work Desk', 'Meeting Room Access', 'Express Check-in', 'Gym'],
    location: 'Chicago, IL',
    available: true,
  },
  {
    id: '6',
    hotelId: 'h1',
    hotelName: 'Azure Bay Resort',
    name: 'Family Suite',
    type: 'Family',
    price: 400,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800',
    description: 'Spacious family suite with two bedrooms and kids-friendly amenities.',
    amenities: ['Free WiFi', 'Two Bedrooms', 'Kids Club', 'Kitchenette', 'Living Room'],
    location: 'Miami Beach, FL',
    available: true,
  },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const addBooking = (booking: Booking) => {
    setBookings((prev) => [...prev, booking]);
    updateRoomAvailability(booking.roomId, false);
  };

  const updateBookingStatus = (bookingId: string, status: 'pending' | 'approved' | 'cancelled') => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId ? { ...booking, status } : booking
      )
    );

    if (status === 'cancelled') {
      const booking = bookings.find((b) => b.id === bookingId);
      if (booking) {
        updateRoomAvailability(booking.roomId, true);
      }
    }
  };

  const updateRoomAvailability = (roomId: string, available: boolean) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId ? { ...room, available } : room
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        rooms,
        bookings,
        addBooking,
        updateBookingStatus,
        updateRoomAvailability,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
