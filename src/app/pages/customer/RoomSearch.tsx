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
  FormGroup,
  FormControlLabel,
  Checkbox,
  Rating,
  Divider,
} from '@mui/material';
import { Star, LocationOn, CheckCircle, Search } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { HotelWithRooms } from '../../../lib/supabase';

const AVAILABLE_ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Cottage'];
const AVAILABLE_AMENITIES = ['WiFi', 'Pool', 'Gym', 'Spa', 'Air Conditioning', 'Restaurant', 'Parking'];

export const RoomSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { destinations, searchHotels, loading: initialLoading } = useApp();

  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    destination: searchParams.get('destination') || 'all',
    priceRange: [0, 20000],
    minRating: 0,
    roomTypes: [] as string[],
    amenities: [] as string[],
  });

  const [hotels, setHotels] = useState<HotelWithRooms[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHotels = async () => {
    setLoading(true);
    const results = await searchHotels(
      filters.search,
      filters.destination !== 'all' ? filters.destination : undefined
    );
    
    // Apply client-side filters
    let filtered = results;
    
    // Filter by Min Rating
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

    // Filter by Room Types (OR logic - hotel must have at least one of the selected room types)
    if (filters.roomTypes.length > 0) {
      filtered = filtered.filter(hotel => {
        if (!hotel.rooms || hotel.rooms.length === 0) return false;
        return hotel.rooms.some(room => {
          const roomName = (room.name || '').toLowerCase();
          const roomTypeStr = ((room as any).type || (room as any).room_type || '').toLowerCase();
          return filters.roomTypes.some(type => 
            roomName.includes(type.toLowerCase()) || roomTypeStr.includes(type.toLowerCase())
          );
        });
      });
    }

    // Filter by Amenities (AND logic - hotel must have all selected amenities)
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(hotel => {
        if (!hotel.amenities || hotel.amenities.length === 0) return false;
        return filters.amenities.every(amenity => hotel.amenities.includes(amenity));
      });
    }
    
    setHotels(filtered);
    setLoading(false);
  };

  useEffect(() => {
    fetchHotels();
  }, [
    filters.search, 
    filters.destination, 
    filters.minRating, 
    filters.priceRange[0], 
    filters.priceRange[1],
    filters.roomTypes.join(','),
    filters.amenities.join(',')
  ]);

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

  const handleArrayFilterToggle = (type: 'roomTypes' | 'amenities', value: string) => {
    setFilters(prev => {
      const currentList = prev[type];
      const currentIndex = currentList.indexOf(value);
      const newList = [...currentList];

      if (currentIndex === -1) {
        newList.push(value);
      } else {
        newList.splice(currentIndex, 1);
      }

      return { ...prev, [type]: newList };
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Explore Philippine Hotels
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Find the perfect accommodation across the beautiful islands of the Philippines
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, position: 'sticky', top: 80, maxHeight: '85vh', overflowY: 'auto' }}>
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
                endAdornment: <Search sx={{ color: 'text.secondary', cursor: 'pointer' }} onClick={handleSearch} />,
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

            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Price Range
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
              </Typography>
              <Slider
                value={filters.priceRange}
                onChange={(_, value) => setFilters({ ...filters, priceRange: value as number[] })}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => formatPrice(v)}
                min={0}
                max={20000}
                step={500}
                sx={{ mx: 1, width: 'calc(100% - 16px)' }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Improved Rating Filter */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Minimum Rating
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating
                  name="min-rating"
                  value={filters.minRating}
                  precision={0.5}
                  onChange={(_, newValue) => {
                    setFilters({ ...filters, minRating: newValue || 0 });
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {filters.minRating > 0 ? `& Up` : 'Any'}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* New Room Type Filter */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Room Type
              </Typography>
              <FormGroup>
                {AVAILABLE_ROOM_TYPES.map((type) => (
                  <FormControlLabel
                    key={type}
                    control={
                      <Checkbox
                        size="small"
                        checked={filters.roomTypes.includes(type)}
                        onChange={() => handleArrayFilterToggle('roomTypes', type)}
                      />
                    }
                    label={<Typography variant="body2">{type}</Typography>}
                  />
                ))}
              </FormGroup>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* New Amenities Filter */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Amenities
              </Typography>
              <FormGroup>
                {AVAILABLE_AMENITIES.map((amenity) => (
                  <FormControlLabel
                    key={amenity}
                    control={
                      <Checkbox
                        size="small"
                        checked={filters.amenities.includes(amenity)}
                        onChange={() => handleArrayFilterToggle('amenities', amenity)}
                      />
                    }
                    label={<Typography variant="body2">{amenity}</Typography>}
                  />
                ))}
              </FormGroup>
            </Box>

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
                  roomTypes: [],
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

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
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
                        borderRadius: 3,
                        cursor: 'pointer',
                        transition: 'box-shadow 0.2s',
                        '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.12)' },
                      }}
                      onClick={() => navigate(`/hotel/${hotel.id}`)}
                    >
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="180"
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

                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                          <Typography variant="h6" fontWeight={600} sx={{ flex: 1, lineHeight: 1.3 }}>
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
                          <Typography variant="h5" color="primary.main" fontWeight={700}>
                            {formatPrice(lowestPrice)}
                            <Typography component="span" variant="body2" color="text.secondary" fontWeight={400}>
                              /night
                            </Typography>
                          </Typography>
                        )}
                      </CardContent>

                      <CardActions sx={{ p: 2, pt: 0 }}>
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
                    roomTypes: [],
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