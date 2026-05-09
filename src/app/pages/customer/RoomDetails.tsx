import { useParams, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Star,
  LocationOn,
  CheckCircle,
  Wifi,
  LocalParking,
  Restaurant,
  FitnessCenter,
  Pool,
  RoomService,
  Spa,
  BeachAccess,
  Kitchen,
  AcUnit,
  Tv,
  People,
} from '@mui/icons-material';
import { supabase, HotelWithRooms, Room } from '../../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const amenityIcons: { [key: string]: JSX.Element } = {
  'WiFi': <Wifi />,
  'Free WiFi': <Wifi />,
  'Parking': <LocalParking />,
  'Restaurant': <Restaurant />,
  'Gym': <FitnessCenter />,
  'Pool': <Pool />,
  'Private Pool': <Pool />,
  'Room Service': <RoomService />,
  'Spa': <Spa />,
  'Beach Access': <BeachAccess />,
  'Private Beach': <BeachAccess />,
  'Kitchen': <Kitchen />,
  'Kitchenette': <Kitchen />,
  'Air Conditioning': <AcUnit />,
  'Smart TV': <Tv />,
};

export const RoomDetails = () => {
  const { id, hotelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hotel, setHotel] = useState<HotelWithRooms | null>(null);
  const [loading, setLoading] = useState(true);

  const entityId = hotelId || id;

  useEffect(() => {
    const fetchHotel = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('hotels')
        .select(`
          *,
          destination:destinations(*),
          rooms(*)
        `)
        .eq('id', entityId)
        .single();

      if (!error && data) {
        setHotel(data);
      }
      setLoading(false);
    };

    if (entityId) {
      fetchHotel();
    }
  }, [entityId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleBookRoom = (room: Room) => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    navigate(`/booking/${room.id}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!hotel) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5">Hotel not found</Typography>
        <Button variant="contained" onClick={() => navigate('/search')} sx={{ mt: 2 }}>
          Back to Search
        </Button>
      </Container>
    );
  }

  const lowestPrice = hotel.rooms && hotel.rooms.length > 0 
    ? Math.min(...hotel.rooms.map(r => r.price_per_night))
    : null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Chip
        label={hotel.rooms?.[0]?.room_type || 'Room type'}
        size="small"
        sx={{ mb: 1.5, bgcolor: '#FFF2CC', color: '#7A5C00', fontWeight: 600 }}
      />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box
              component="img"
              src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
              alt={hotel.name}
              sx={{ width: '100%', height: { xs: 240, md: 300 }, objectFit: 'cover' }}
            />
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={9}>
          {/* Hotel Info */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1.5, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {hotel.featured && (
                    <Chip
                      label="Featured"
                      size="small"
                      sx={{ bgcolor: '#FCD116', color: '#0F172A', fontWeight: 600 }}
                    />
                  )}
                  <Chip
                    icon={<Star sx={{ color: '#FCD116 !important' }} />}
                    label={`${hotel.rating.toFixed(1)} (${hotel.review_count} reviews)`}
                    sx={{ bgcolor: '#0066B3', color: 'white' }}
                  />
                </Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  {hotel.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ mr: 0.5 }} />
                  {hotel.address && `${hotel.address}, `}{hotel.city}, {hotel.province}
                </Typography>
              </Box>
            </Box>

            <Typography variant="body1" color="text.secondary" paragraph sx={{ mt: 2 }}>
              {hotel.description}
            </Typography>
          </Box>

          <Grid container spacing={1.5} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 1.5, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
                <Typography variant="caption" color="text.secondary">Room size</Typography>
                <Typography variant="subtitle1" fontWeight={700}>40 m²</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 1.5, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
                <Typography variant="caption" color="text.secondary">Capacity</Typography>
                <Typography variant="subtitle1" fontWeight={700}>{Math.max(...(hotel.rooms?.map(r => r.capacity) || [2]))} Guests</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 1.5, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
                <Typography variant="caption" color="text.secondary">Price</Typography>
                <Typography variant="subtitle1" fontWeight={700}>{lowestPrice ? formatPrice(lowestPrice) : 'N/A'}</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Amenities */}
          <Paper sx={{ p: 2, mb: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Hotel Amenities
            </Typography>
            <Grid container spacing={2}>
              {hotel.amenities?.map((amenity, index) => (
                <Grid item xs={6} sm={4} key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: 'primary.main' }}>
                      {amenityIcons[amenity] || <CheckCircle />}
                    </Box>
                    <Typography variant="body2">{amenity}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Available Rooms */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Select your room
            </Typography>
            <Grid container spacing={2}>
              {hotel.rooms?.map((room) => (
                <Grid item xs={12} key={room.id}>
                  <Card sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, borderRadius: 2, border: '1px solid #D1D5DB', boxShadow: 'none' }}>
                    <CardMedia
                      component="img"
                      sx={{ width: { xs: '100%', sm: 180 }, height: { xs: 140, sm: 170 } }}
                      image={room.images?.[0] || hotel.images?.[0] || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'}
                      alt={room.name}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 1 }}>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={700}>
                              {room.name}
                            </Typography>
                            <Chip label={room.room_type} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                          </Box>
                          {room.available ? (
                            <Chip label="Available" color="success" size="small" icon={<CheckCircle />} />
                          ) : (
                            <Chip label="Occupied" color="error" size="small" />
                          )}
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                          {room.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <People sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Up to {room.capacity} guests
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                          {room.amenities?.slice(0, 4).map((amenity, idx) => (
                            <Chip key={idx} label={amenity} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                          ))}
                        </Box>
                      </CardContent>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pt: 0 }}>
                        <Typography variant="h6" color="primary.main" fontWeight={700}>
                          {formatPrice(room.price_per_night)}
                          <Typography component="span" variant="body2" color="text.secondary" fontWeight={400}>
                            /night
                          </Typography>
                        </Typography>
                        <Button
                          variant="contained"
                          disabled={!room.available}
                          onClick={() => handleBookRoom(room)}
                        >
                          {room.available ? 'Book Now' : 'Unavailable'}
                        </Button>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Property Info */}
          <Paper sx={{ p: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Property Policies
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Check-in:</strong> 2:00 PM - 11:00 PM
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Check-out:</strong> Until 12:00 PM
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Free cancellation up to 24 hours before check-in. Early check-in and late check-out available upon request.
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, position: 'sticky', top: 80, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            {lowestPrice && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Starting from
                </Typography>
                <Typography variant="h4" color="primary.main" fontWeight={700}>
                  {formatPrice(lowestPrice)}
                  <Typography component="span" variant="body1" color="text.secondary" fontWeight={400}>
                    /night
                  </Typography>
                </Typography>
              </Box>
            )}

            <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 2, mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Why book with EBook Na PH?
              </Typography>
              <List dense disablePadding>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircle sx={{ color: 'success.main', fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Best price guarantee" 
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircle sx={{ color: 'success.main', fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Free cancellation available" 
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircle sx={{ color: 'success.main', fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="24/7 customer support" 
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              </List>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => {
                const firstAvailableRoom = hotel.rooms?.find(r => r.available);
                if (firstAvailableRoom) {
                  handleBookRoom(firstAvailableRoom);
                }
              }}
              disabled={!hotel.rooms?.some(r => r.available)}
              sx={{ mb: 2 }}
            >
              {hotel.rooms?.some(r => r.available) ? 'Book a Room' : 'No Rooms Available'}
            </Button>

            <Typography variant="caption" color="text.secondary" align="center" display="block">
              Prices include taxes and fees
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
