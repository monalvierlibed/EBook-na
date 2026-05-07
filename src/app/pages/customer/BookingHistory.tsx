import { useState } from 'react';
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
} from '@mui/material';
import { CalendarMonth, Person, Download, Cancel as CancelIcon, CheckCircle, Pending } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';

export const BookingHistory = () => {
  const { bookings, rooms, updateBookingStatus } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; bookingId: string }>({
    open: false,
    bookingId: '',
  });

  const getRoom = (roomId: string) => rooms.find((r) => r.id === roomId);

  const filteredBookings =
    activeTab === 0
      ? bookings.filter((b) => b.status === 'pending' || b.status === 'approved')
      : bookings.filter((b) => b.status === 'cancelled');

  const handleCancelBooking = () => {
    updateBookingStatus(cancelDialog.bookingId, 'cancelled');
    toast.success('Booking cancelled successfully');
    setCancelDialog({ open: false, bookingId: '' });
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'approved':
        return <Chip icon={<CheckCircle />} label="Approved" color="success" size="small" />;
      case 'pending':
        return <Chip icon={<Pending />} label="Pending" color="warning" size="small" />;
      case 'cancelled':
        return <Chip icon={<CancelIcon />} label="Cancelled" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

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
          <Tab label="Active Bookings" />
          <Tab label="Past Bookings" />
        </Tabs>
      </Box>

      {filteredBookings.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No bookings found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activeTab === 0
              ? 'You have no active bookings at the moment'
              : 'You have no past bookings'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredBookings.map((booking) => {
            const room = getRoom(booking.roomId);
            return (
              <Grid item xs={12} key={booking.id}>
                <Card sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                  {room && (
                    <CardMedia
                      component="img"
                      sx={{ width: { xs: '100%', sm: 200 }, height: { xs: 200, sm: 'auto' } }}
                      image={room.image}
                      alt={booking.roomName}
                    />
                  )}

                  <CardContent sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {booking.roomName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {booking.hotelName}
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
                              {new Date(booking.checkIn).toLocaleDateString()}
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
                              {new Date(booking.checkOut).toLocaleDateString()}
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
                              {booking.guests}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Booking ID: {booking.id}
                        </Typography>
                        <Typography variant="h6" color="primary.main" fontWeight={700}>
                          ${booking.totalPrice.toFixed(2)}
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

                        {booking.status !== 'cancelled' && (
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
          <Button onClick={() => setCancelDialog({ open: false, bookingId: '' })}>Keep Booking</Button>
          <Button variant="contained" color="error" onClick={handleCancelBooking}>
            Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
