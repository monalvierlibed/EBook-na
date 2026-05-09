import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Download, Cancel as CancelIcon, CheckCircle, Schedule, LocationOn } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export const BookingHistory = () => {
  const navigate = useNavigate();
  const { bookings, cancelBooking, fetchBookings, loading } = useApp();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; bookingId: string }>({
    open: false,
    bookingId: '',
  });
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === 0) return true;
    const checkInDate = new Date(booking.check_in);
    if (activeTab === 1) return checkInDate >= today && (booking.status === 'pending' || booking.status === 'confirmed');
    return checkInDate < today || booking.status === 'completed' || booking.status === 'cancelled';
  });

  const handleCancelBooking = async () => {
    setCancelling(true);
    const { error } = await cancelBooking(cancelDialog.bookingId);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Booking cancelled successfully');
    }
    
    setCancelling(false);
    setCancelDialog({ open: false, bookingId: '' });
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Chip icon={<CheckCircle />} label="Confirmed" size="small" sx={{ bgcolor: '#E9F9EC', color: '#2E7D32' }} />;
      case 'pending':
        return <Chip icon={<Schedule />} label="Pending" size="small" sx={{ bgcolor: '#FFF7E6', color: '#B26A00' }} />;
      case 'cancelled':
        return <Chip icon={<CancelIcon />} label="Cancelled" size="small" sx={{ bgcolor: '#FDEBEC', color: '#B3261E' }} />;
      case 'completed':
        return <Chip icon={<CheckCircle />} label="Completed" size="small" sx={{ bgcolor: '#EEF5FF', color: '#1A73E8' }} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Please sign in to view your bookings
        </Typography>
        <Button variant="contained" onClick={() => navigate('/auth/login')} sx={{ mt: 2 }}>
          Sign In
        </Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        My Bookings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        View and manage your hotel reservations
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label={`All Bookings`} />
          <Tab label={`Upcoming Bookings`} />
          <Tab label={`Past Bookings`} />
        </Tabs>
      </Box>

      {filteredBookings.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No bookings found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {activeTab === 0
              ? 'You have no active bookings at the moment'
              : 'You have no past bookings'}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/search')}>
            Explore Hotels
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredBookings.map((booking) => {
            const room = booking.room;
            const hotel = room?.hotel;
            
            return (
              <Grid item xs={12} key={booking.id}>
                <Card sx={{ borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                  <CardMedia
                    component="img"
                    sx={{ width: { xs: '100%', sm: 150 }, height: { xs: 160, sm: 160 }, objectFit: 'cover', bgcolor: '#EEE9FF' }}
                    image={room?.images?.[0] || hotel?.images?.[0] || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'}
                    alt={room?.name || 'Hotel Room'}
                  />

                  <CardContent sx={{ flex: 1, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {hotel?.name || 'Hotel Name'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOn sx={{ fontSize: 14 }} /> {hotel?.city || 'Location'}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {room?.name || 'Room name'}
                        </Typography>
                      </Box>
                      {getStatusChip(booking.status)}
                    </Box>

                    <Grid container spacing={1} sx={{ mb: 1 }}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary">Check-in</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {new Date(booking.check_in).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary">Check-out</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {new Date(booking.check_out).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary">Guest</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                      <Box>
                        <Typography variant="h6" color="primary.main" fontWeight={800}>
                          {formatPrice(booking.total_price)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => navigate(`/hotel/${room?.hotel_id || ''}`)}
                        >
                          Details
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Download />}
                          onClick={() => toast.success('Receipt downloaded')}
                        >
                          Receipt
                        </Button>

                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => setCancelDialog({ open: true, bookingId: booking.id })}
                          >
                            Cancel
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog open={cancelDialog.open} onClose={() => setCancelDialog({ open: false, bookingId: '' })}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to cancel this booking? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog({ open: false, bookingId: '' })} disabled={cancelling}>
            Keep Booking
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleCancelBooking}
            disabled={cancelling}
            startIcon={cancelling ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {cancelling ? 'Cancelling...' : 'Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
