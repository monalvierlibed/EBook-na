import { HotelWithRooms } from './supabase';

// Updated to use your new API key
const API_KEY = import.meta.env.VITE_RAPIDAPI_KEY || '00b5b82b464e4594ad5f04bb46449e33';
const API_HOST = 'booking-com15.p.rapidapi.com'; 

export const searchLiveHotelsFromAPI = async (locationQuery: string): Promise<HotelWithRooms[]> => {
  try {
    const destResponse = await fetch(
      `https://${API_HOST}/api/v1/hotels/searchDestination?query=${encodeURIComponent(locationQuery)}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': API_HOST,
        },
      }
    );
    
    const destData = await destResponse.json();
    const destId = destData.data?.[0]?.dest_id;

    if (!destId) return [];

    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 7);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 8);

    const checkInStr = checkIn.toISOString().split('T')[0];
    const checkOutStr = checkOut.toISOString().split('T')[0];

    const hotelsResponse = await fetch(
      `https://${API_HOST}/api/v1/hotels/searchHotels?dest_id=${destId}&search_type=CITY&arrival_date=${checkInStr}&departure_date=${checkOutStr}&adults=2&room_qty=1&page_number=1`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': API_HOST,
        },
      }
    );

    const hotelsData = await hotelsResponse.json();
    
    const formattedHotels: HotelWithRooms[] = hotelsData.data?.hotels?.slice(0, 10).map((apiHotel: any) => ({
      id: apiHotel.hotel_id.toString(),
      name: apiHotel.property.name,
      description: `A lovely stay located in ${locationQuery}.`,
      city: locationQuery.split(',')[0],
      province: 'Philippines',
      rating: apiHotel.property.reviewScore || 4.0,
      review_count: apiHotel.property.reviewCount || 0,
      amenities: ['Free WiFi', 'Air Conditioning', 'Daily Housekeeping'],
      images: [apiHotel.property.photoUrls?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
      featured: apiHotel.property.isPreferred || false,
      rooms: [
        {
          id: `room-${apiHotel.hotel_id}`,
          hotel_id: apiHotel.hotel_id.toString(),
          name: 'Standard Room',
          price_per_night: Math.round(apiHotel.property.priceBreakdown?.grossPrice?.value || 3500),
          available: true,
          amenities: [],
          images: [],
          capacity: 2,
          room_type: 'Standard'
        }
      ]
    })) || [];

    return formattedHotels;

  } catch (error) {
    console.error("Error fetching live hotels:", error);
    return [];
  }
};