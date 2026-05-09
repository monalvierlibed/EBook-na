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
} from '@mui/material';
import { CalendarMonth, Person, Download, Cancel as CancelIcon, CheckCircle, Pending, Schedule } from '@mui/icons-material';
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

  const filteredBookings =
    activeTab === 0
      ? bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed')
      : bookings.filter((b) => b.status === 'cancelled' || b.status === 'completed');

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
        return <Chip icon={<CheckCircle />} label="Confirmed" color="success" size="small" />;
      case 'pending':
        return <Chip icon={<Schedule />} label="Pending" color="warning" size="small" />;
      case 'cancelled':
        return <Chip icon={<CancelIcon />} label="Cancelled" color="error" size="small" />;
      case 'completed':
        return <Chip icon={<CheckCircle />} label="Completed" color="info" size="small" />;
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
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View and manage your hotel reservations
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label={`Active (${bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length})`} />
          <Tab label={`Past (${bookings.filter(b => b.status === 'cancelled' || b.status === 'completed').length})`} />
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
                <Card sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                  <CardMedia
                    component="img"
                    sx={{ width: { xs: '100%', sm: 200 }, height: { xs: 200, sm: 'auto' } }}
                    image={room?.images?.[0] || hotel?.images?.[0] || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'}
                    alt={room?.name || 'Hotel Room'}
                  />

                  <CardContent sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {room?.name || 'Room'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {hotel?.name || 'Hotel'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {hotel?.city}, {hotel?.province}
                        </Typography>
                      </Box>
                      {getStatusChip(booking.status)}
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarMonth sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Check-in
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {new Date(booking.check_in).toLocaleDateString('en-PH', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarMonth sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Check-out
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {new Date(booking.check_out).toLocaleDateString('en-PH', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Person sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Guests
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Booked on {new Date(booking.created_at).toLocaleDateString('en-PH')}
                        </Typography>
                        <Typography variant="h6" color="primary.main" fontWeight={700}>
                          {formatPrice(booking.total_price)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
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
                            startIcon={<CancelIcon />}
                            onClick={() => setCancelDialog({ open: true, bookingId: booking.id })}
                          >
                            Cancel
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
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
