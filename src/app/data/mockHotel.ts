import { HotelWithRooms } from '../../lib/supabase';

export const mockIlocosHotels: HotelWithRooms[] = [
  {
    id: 'mock-ilocos-1',
    name: 'Fort Ilocandia Resort Hotel',
    description: 'A sprawling historic resort with Spanish-Moroccan architecture, featuring a private beach and casino.',
    address: 'Brgy. 37 Calayab',
    city: 'Laoag City',
    province: 'Ilocos Norte',
    rating: 4.5,
    review_count: 1500,
    amenities: ['Pool', 'Beachfront', 'Casino', 'Free WiFi', 'Restaurant'],
    images: ['https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800'],
    featured: true,
    destination_id: 'mock-dest-ilocos',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    rooms: [
      {
        id: 'mock-room-1',
        hotel_id: 'mock-ilocos-1',
        name: 'Standard Double Room',
        room_type: 'Standard',
        description: 'Comfortable room with a garden view.',
        price_per_night: 3500,
        capacity: 2,
        amenities: ['Air Conditioning', 'TV'],
        images: [],
        available: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ]
  },
  {
    id: 'mock-ilocos-2',
    name: 'Saud Beach Resort and Hotel',
    description: 'Situated on the pristine white sands of Saud Beach, offering breathtaking sunset views.',
    address: 'Saud White Beach Cove',
    city: 'Pagudpud',
    province: 'Ilocos Norte',
    rating: 4.6,
    review_count: 1200,
    amenities: ['Beachfront', 'Water Sports', 'Parking', 'Free WiFi', 'Restaurant'],
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'],
    featured: true,
    destination_id: 'mock-dest-ilocos',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    rooms: [
      {
        id: 'mock-room-2',
        hotel_id: 'mock-ilocos-2',
        name: 'Ocean View Suite',
        room_type: 'Suite',
        description: 'Wake up to the sound of waves.',
        price_per_night: 5500,
        capacity: 2,
        amenities: ['Air Conditioning', 'Ocean View', 'Balcony'],
        images: [],
        available: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ]
  },
  {
    id: 'mock-ilocos-3',
    name: 'Playa Tropical Resort Hotel',
    description: 'A beautiful Balinese-inspired beachfront sanctuary perfect for relaxing getaways.',
    address: 'Barangay Victoria',
    city: 'Currimao',
    province: 'Ilocos Norte',
    rating: 4.5,
    review_count: 780,
    amenities: ['Pool', 'Beachfront', 'Spa', 'Free WiFi', 'Restaurant'],
    images: ['https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800'],
    featured: true,
    destination_id: 'mock-dest-ilocos',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    rooms: [
      {
        id: 'mock-room-3',
        hotel_id: 'mock-ilocos-3',
        name: 'Poolside Casita',
        room_type: 'Villa',
        description: 'Direct access to the infinity pool.',
        price_per_night: 4800,
        capacity: 2,
        amenities: ['Air Conditioning', 'Terrace'],
        images: [],
        available: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ]
  }
];