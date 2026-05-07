import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Container,
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Paper,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Star, LocationOn, CheckCircle, Search } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { HotelWithRooms } from '../../../lib/supabase';

export const RoomSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { destinations, searchHotels, loading: initialLoading } = useApp();

  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    destination: searchParams.get('destination') || 'all',
    priceRange: [0, 20000],
    minRating: 0,
    roomType: 'all',
    amenities: [] as string[],
  });

  const [hotels, setHotels] = useState<HotelWithRooms[]>([]);
  const [allHotels, setAllHotels] = useState<HotelWithRooms[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHotels = async () => {
    setLoading(true);
    const results = await searchHotels(
      filters.search,
      filters.destination !== 'all' ? filters.destination : undefined
    );
    setAllHotels(results);
    
    // Apply client-side filters
    let filtered = results;
    
    if (filters.minRating > 0) {
      filtered = filtered.filter(hotel => hotel.rating >= filters.minRating);
    }
    
    // Filter by price range (check if any room falls within range)
    filtered = filtered.filter(hotel => {
      if (!hotel.rooms || hotel.rooms.length === 0) return true;
      return hotel.rooms.some(
        room => room.price_per_night >= filters.priceRange[0] && 
                room.price_per_night <= filters.priceRange[1]
      );
    });

    if (filters.roomType !== 'all') {
      filtered = filtered.filter((hotel) =>
        hotel.rooms?.some((room) => room.room_type === filters.roomType)
      );
    }

    if (filters.amenities.length > 0) {
      filtered = filtered.filter((hotel) => {
        const hotelAmenities = hotel.amenities || [];
        const roomAmenities = hotel.rooms?.flatMap((room) => room.amenities || []) || [];
        const combinedAmenities = new Set([...hotelAmenities, ...roomAmenities]);
        return filters.amenities.every((amenity) => combinedAmenities.has(amenity));
      });
    }
    
    setHotels(filtered);
    setLoading(false);
  };

  useEffect(() => {
    fetchHotels();
  }, [filters.search, filters.destination, filters.minRating, filters.priceRange]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getLowestPrice = (hotel: HotelWithRooms) => {
    if (!hotel.rooms || hotel.rooms.length === 0) return null;
    return Math.min(...hotel.rooms.map(r => r.price_per_night));
  };

  const handleSearch = () => {
    fetchHotels();
  };

  const amenityOptions = Array.from(
    new Set(
      allHotels
        .flatMap((hotel) => [
          ...(hotel.amenities || []),
          ...(hotel.rooms?.flatMap((room) => room.amenities || []) || []),
        ])
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        All Hotels
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Compare rooms, prices, ratings, and amenities.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 2.5,
              position: 'sticky',
              top: 80,
              borderRadius: 3,
              border: '1px solid',
              borderColor: '#E5E7EB',
              boxShadow: '0 8px 18px rgba(17, 24, 39, 0.06)',
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Filters
            </Typography>

            <TextField
              fullWidth
              label="Search hotels or locations"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              margin="normal"
              size="small"
              InputProps={{
                endAdornment: <Search sx={{ color: 'text.secondary' }} />,
              }}
            />

            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Destination</InputLabel>
              <Select
                value={filters.destination}
                label="Destination"
                onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
              >
                <MenuItem value="all">All Destinations</MenuItem>
                {destinations.map((dest) => (
                  <MenuItem key={dest.id} value={dest.id}>
                    {dest.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" gutterBottom>
                Price Range: {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
              </Typography>
              <Slider
                value={filters.priceRange}
                onChange={(_, value) => setFilters({ ...filters, priceRange: value as number[] })}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => formatPrice(v)}
                min={0}
                max={20000}
                step={500}
              />
            </Box>

            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Room Type</InputLabel>
              <Select
                value={filters.roomType}
                label="Room Type"
                onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}
              >
                <MenuItem value="all">All Room Types</MenuItem>
                <MenuItem value="Standard">Standard</MenuItem>
                <MenuItem value="Deluxe">Deluxe</MenuItem>
                <MenuItem value="Suite">Suite</MenuItem>
                <MenuItem value="Cottage">Cottage</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Amenities</InputLabel>
              <Select
                multiple
                value={filters.amenities}
                label="Amenities"
                onChange={(e) => setFilters({ ...filters, amenities: e.target.value as string[] })}
                renderValue={(selected) =>
                  selected.length > 0 ? `${selected.length} selected` : 'Select amenities'
                }
              >
                {amenityOptions.map((amenity) => (
                  <MenuItem key={amenity} value={amenity}>
                    {amenity}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Min Rating</InputLabel>
              <Select
                value={filters.minRating}
                label="Min Rating"
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value as number })}
              >
                <MenuItem value={0}>All Ratings</MenuItem>
                <MenuItem value={4.0}>4.0+ Stars</MenuItem>
                <MenuItem value={4.5}>4.5+ Stars</MenuItem>
                <MenuItem value={4.8}>4.8+ Stars</MenuItem>
              </Select>
            </FormControl>

            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => {
                setFilters({
                  search: '',
                  destination: 'all',
                  priceRange: [0, 20000],
                  minRating: 0,
                  roomType: 'all',
                  amenities: [],
                });
              }}
            >
              Reset Filters
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1">
              <strong>{hotels.length}</strong> hotels found
            </Typography>
          </Box>

          {(filters.roomType !== 'all' || filters.amenities.length > 0 || filters.minRating > 0) && (
            <Paper sx={{ p: 2, mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Active filters
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {filters.roomType !== 'all' && <Chip size="small" label={`Room: ${filters.roomType}`} />}
                {filters.minRating > 0 && <Chip size="small" label={`Rating: ${filters.minRating}+`} />}
                {filters.amenities.map((amenity) => (
                  <Chip key={amenity} size="small" label={amenity} />
                ))}
              </Box>
            </Paper>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2.5}>
              {hotels.map((hotel) => {
                const lowestPrice = getLowestPrice(hotel);
                const hasAvailableRooms = hotel.rooms?.some(r => r.available) ?? false;
                
                return (
                  <Grid item xs={12} sm={6} lg={4} key={hotel.id}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: '#E5E7EB',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(17, 24, 39, 0.06)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 10px 20px rgba(17, 24, 39, 0.12)',
                        },
                      }}
                      onClick={() => navigate(`/hotel/${hotel.id}`)}
                    >
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="156"
                          image={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
                          alt={hotel.name}
                        />
                        {hotel.featured && (
                          <Chip
                            label="Featured"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 12,
                              left: 12,
                              bgcolor: '#FCD116',
                              color: '#0F172A',
                              fontWeight: 600,
                            }}
                          />
                        )}
                        {hasAvailableRooms ? (
                          <Chip
                            label="Available"
                            color="success"
                            size="small"
                            icon={<CheckCircle />}
                            sx={{ position: 'absolute', top: 12, right: 12 }}
                          />
                        ) : (
                          <Chip
                            label="Fully Booked"
                            color="error"
                            size="small"
                            sx={{ position: 'absolute', top: 12, right: 12 }}
                          />
                        )}
                      </Box>

                      <CardContent sx={{ flexGrow: 1, p: 1.75 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1, lineHeight: 1.3 }}>
                            {hotel.name}
                          </Typography>
                          <Chip
                            icon={<Star sx={{ fontSize: 14, color: '#FCD116 !important' }} />}
                            label={hotel.rating.toFixed(1)}
                            size="small"
                            sx={{ bgcolor: '#0066B3', color: 'white', ml: 1 }}
                          />
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                          {hotel.city}, {hotel.province}
                        </Typography>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                          {hotel.amenities?.slice(0, 3).map((amenity, idx) => (
                            <Chip key={idx} label={amenity} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                          ))}
                        </Box>

                        {lowestPrice && (
                          <>
                            <Divider sx={{ mb: 1.5 }} />
                            <Typography variant="h6" color="primary.main" fontWeight={700}>
                              {formatPrice(lowestPrice)}
                              <Typography component="span" variant="body2" color="text.secondary" fontWeight={400}>
                                /night
                              </Typography>
                            </Typography>
                          </>
                        )}
                      </CardContent>

                      <CardActions sx={{ p: 1.75, pt: 0 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/hotel/${hotel.id}`);
                          }}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {!loading && hotels.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No hotels found matching your criteria
              </Typography>
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => {
                  setFilters({
                    search: '',
                    destination: 'all',
                    priceRange: [0, 20000],
                    minRating: 0,
                    roomType: 'all',
                    amenities: [],
                  });
                }}
              >
                Clear Filters
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};
