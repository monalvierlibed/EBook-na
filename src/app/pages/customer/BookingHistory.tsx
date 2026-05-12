import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress,
  GlobalStyles
} from '@mui/material';
import { ConfirmationNumber, Print, Hotel, CalendarMonth, Payment, Cancel } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { BookingWithDetails, supabase } from '../../../lib/supabase'; // <-- Added supabase import

export const BookingHistory = () => {
  const { bookings, fetchBookings, loading } = useApp();
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  
  // NEW: Track which booking is currently being cancelled
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenVoucher = (booking: BookingWithDetails) => {
    setSelectedBooking(booking);
  };

  const handleCloseVoucher = () => {
    setSelectedBooking(null);
  };

  const handlePrint = () => {
    window.print();
  };

  // NEW: The Cancel Handler
  const handleCancelBooking = async (bookingId: string) => {
    const isConfirmed = window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.");
    if (!isConfirmed) return;

    setCancellingId(bookingId); // Show spinner for this specific button
    try {
      // Update the database to set status to 'cancelled'
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      alert('Booking cancelled successfully!');
      fetchBookings(); // Refresh the list from AppContext so the UI updates
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking: ' + error.message);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <GlobalStyles styles={{
        '@media print': {
          'body *': { visibility: 'hidden' },
          '#printable-voucher, #printable-voucher *': { visibility: 'visible' },
          '#printable-voucher': { 
            position: 'absolute', 
            left: 0, 
            top: 0, 
            width: '100%',
            boxShadow: 'none',
          },
          '.no-print': { display: 'none !important' }
        }
      }} />

      <Typography variant="h4" fontWeight={700} gutterBottom>
        My Bookings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View, download, or cancel your hotel reservations.
      </Typography>

      {bookings.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', bgcolor: '#F8FAFC' }}>
          <Typography variant="h6" color="text.secondary">You have no bookings yet.</Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {bookings.map((booking) => (
            <Grid item xs={12} key={booking.id}>
              <Card sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', p: 2 }}>
                <Box sx={{ flex: 1, width: '100%' }}>
                  <Typography variant="h6" fontWeight={600}>
                    {booking.room?.hotel?.name || 'Hotel Name Unavailable'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {booking.room?.name || 'Room Details Unavailable'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip size="small" icon={<CalendarMonth />} label={`${formatDate(booking.check_in)} - ${formatDate(booking.check_out)}`} />
                    <Chip 
                      size="small" 
                      label={booking.status.toUpperCase()} 
                      color={booking.status === 'confirmed' ? 'success' : booking.status === 'cancelled' ? 'error' : 'warning'} 
                    />
                  </Box>
                </Box>
                
                {/* MODIFIED: Wrapped buttons in a column layout */}
                <Box sx={{ mt: { xs: 2, sm: 0 }, ml: { sm: 2 }, minWidth: '160px', display: 'flex', flexDirection: 'column', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    startIcon={<ConfirmationNumber />}
                    onClick={() => handleOpenVoucher(booking)}
                    disabled={booking.status !== 'confirmed'}
                  >
                    View Voucher
                  </Button>

                  {/* NEW: Cancel Button */}
                  {booking.status !== 'cancelled' && (
                    <Button 
                      variant="outlined" 
                      color="error"
                      fullWidth 
                      startIcon={cancellingId === booking.id ? <CircularProgress size={16} color="error" /> : <Cancel />}
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={cancellingId === booking.id || booking.status === 'cancelled'}
                    >
                      {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                    </Button>
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* --- THE VOUCHER MODAL --- */}
      <Dialog 
        open={!!selectedBooking} 
        onClose={handleCloseVoucher}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        {selectedBooking && (
          <>
            <DialogContent id="printable-voucher" sx={{ p: 0, overflow: 'hidden' }}>
              {/* Hotel Header */}
              <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 4, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={800} letterSpacing={2}>
                  E-BOOK MO NA
                </Typography>
                <Typography variant="subtitle2" sx={{ opacity: 0.8, letterSpacing: 1 }}>
                  OFFICIAL BOOKING VOUCHER
                </Typography>
              </Box>

              <Box sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                      BOOKING REFERENCE
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      {selectedBooking.id.split('-')[0].toUpperCase()}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Hotel color="action" sx={{ mr: 1, mt: 0.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">HOTEL</Typography>
                        <Typography variant="body1" fontWeight={600}>{selectedBooking.room?.hotel?.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{selectedBooking.room?.name}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <CalendarMonth color="action" sx={{ mr: 1, mt: 0.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">DATES</Typography>
                        <Typography variant="body2"><strong>Check-in:</strong> {formatDate(selectedBooking.check_in)}</Typography>
                        <Typography variant="body2"><strong>Check-out:</strong> {formatDate(selectedBooking.check_out)}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Payment color="action" sx={{ mr: 1, mt: 0.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">AMOUNT PAID</Typography>
                        <Typography variant="h6" fontWeight={700} color="success.main">
                          {formatPrice(selectedBooking.total_price)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Status: PAID</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
                    <Typography variant="caption" color="text.secondary" display="block">GUESTS</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedBooking.guests} Person(s)</Typography>
                  </Grid>

                </Grid>

                <Box sx={{ mt: 4, textAlign: 'center', p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px dashed #CBD5E1' }}>
                  <Box sx={{ width: 100, height: 100, bgcolor: 'black', mx: 'auto', mb: 1, 
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #ccc 10px, #ccc 20px)' }} 
                  />
                  <Typography variant="caption" color="text.secondary">
                    Present this voucher upon check-in.
                  </Typography>
                </Box>
              </Box>
            </DialogContent>

            <DialogActions className="no-print" sx={{ p: 3, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
              <Button onClick={handleCloseVoucher} color="inherit">
                Close
              </Button>
              <Button 
                onClick={handlePrint} 
                variant="contained" 
                startIcon={<Print />}
              >
                Save as PDF / Print
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};