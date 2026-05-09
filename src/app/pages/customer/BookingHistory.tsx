import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Divider,
} from '@mui/material';
import { CalendarMonth, Hotel as HotelIcon, AttachMoney, Receipt } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

export const BookingHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyBookings = async () => {
      if (!user) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id, created_at, check_in, check_out, total_price, status, guests,
          rooms (
            name,
            images,
            hotel:hotels (name, city, province)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setBookings(data);
      }
      setLoading(false);
    };

    fetchMyBookings();
  }, [user]);

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'approved':
        return <Chip label="Confirmed" color="success" size="small" sx={{ fontWeight: 600 }} />;
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" sx={{ fontWeight: 600 }} />;
      case 'cancelled':
        return <Chip label="Cancelled" color="error" size="small" sx={{ fontWeight: 600 }} />;
      case 'completed':
        return <Chip label="Completed" color="info" size="small" sx={{ fontWeight: 600 }} />;
      default:
        return <Chip label={status || 'Unknown'} size="small" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        My Bookings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View and manage your past and upcoming stays.
      </Typography>

      {bookings.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <Receipt sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No bookings found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Looks like you haven't booked a stay with us yet.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/search')}>
            Explore Hotels
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {bookings.map((booking) => (
            <Grid item xs={12} key={booking.id}>
              <Card sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, borderRadius: 3, overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  sx={{ width: { xs: '100%', md: 300 }, height: { xs: 200, md: 'auto' }, objectFit: 'cover' }}
                  image={booking.rooms?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
                  alt={booking.rooms?.name}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <CardContent sx={{ flex: '1 0 auto', p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {booking.rooms?.hotel?.name || 'Hotel Name Unavailable'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <HotelIcon sx={{ fontSize: 16, mr: 0.5 }} />
                          {booking.rooms?.name || 'Room Name Unavailable'}
                        </Typography>
                      </Box>
                      {getStatusChip(booking.status)}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary" display="block">Check-in</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatDate(booking.check_in)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary" display="block">Check-out</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatDate(booking.check_out)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary" display="block">Guests</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {booking.guests || 1} {booking.guests === 1 ? 'Guest' : 'Guests'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary" display="block">Total Paid</Typography>
                        <Typography variant="body2" fontWeight={700} color="primary.main">
                          {formatPrice(booking.total_price)}
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Typography variant="caption" color="text.disabled">
                            Booking Ref: {booking.id.split('-')[0].toUpperCase()}
                        </Typography>
                    </Box>
                  </CardContent>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};