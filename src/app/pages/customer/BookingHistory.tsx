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
} from '@mui/material';
import { ConfirmationNumber, Hotel, CalendarMonth, Payment, Cancel, PictureAsPdf, Description } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { BookingWithDetails, supabase } from '../../../lib/supabase';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuth } from '../../context/AuthContext';



export const BookingHistory = () => {
  const { bookings, fetchBookings, loading } = useApp();
  const { user } = useAuth();
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenVoucher = (booking: BookingWithDetails) => {
    setSelectedBooking(booking);
  };

  const handleCloseVoucher = () => {
    setSelectedBooking(null);
  };

  // --- NEW: Export to TXT ---
  const handleExportTXT = () => {
    if (!selectedBooking) return;

    const ref = selectedBooking.id.split('-')[0].toUpperCase();
    const textContent = `
E-BOOK MO NA - OFFICIAL BOOKING VOUCHER
=========================================
BOOKING REFERENCE: ${ref}

HOTEL DETAILS
Hotel: ${selectedBooking.room?.hotel?.name || 'N/A'}
Room: ${selectedBooking.room?.name || 'N/A'}

RESERVATION DATES
Check-in: ${formatDate(selectedBooking.check_in)}
Check-out: ${formatDate(selectedBooking.check_out)}

PAYMENT DETAILS
Amount Paid: ${formatPrice(selectedBooking.total_price)}
Status: PAID

GUESTS: ${selectedBooking.guests} Person(s)
=========================================
Please present this voucher upon check-in.
    `.trim();

    // Create a Blob containing the text data
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = `Voucher-${ref}.txt`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- NEW: Export to PDF ---
  const handleExportPDF = async () => {
    const voucherElement = document.getElementById('printable-voucher');
    if (!voucherElement || !selectedBooking) return;

    setIsExporting(true);
    try {
      const ref = selectedBooking.id.split('-')[0].toUpperCase();
      
      // Capture the HTML element as a canvas
      const canvas = await html2canvas(voucherElement, { 
        scale: 2, // Higher scale for better resolution 
        useCORS: true // Allows loading external images if you have any
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate PDF dimensions based on the canvas aspect ratio
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      // Add the image to the PDF and download it
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Voucher-${ref}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate the PDF file. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const isConfirmed = window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.");
    if (!isConfirmed) return;

    setCancellingId(bookingId);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      if (user) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          title: 'Booking Cancelled',
          message: `Your reservation has been successfully cancelled.`,
          type: 'reservation_cancelled',
          read: false
        });
      }

      alert('Booking cancelled successfully!');
      fetchBookings();
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
            <Grid xs={12} key={booking.id}>
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
                  <Grid xs={12}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                      BOOKING REFERENCE
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      {selectedBooking.id.split('-')[0].toUpperCase()}
                    </Typography>
                  </Grid>

                  <Grid xs={12}>
                    <Divider />
                  </Grid>

                  <Grid xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Hotel color="action" sx={{ mr: 1, mt: 0.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">HOTEL</Typography>
                        <Typography variant="body1" fontWeight={600}>{selectedBooking.room?.hotel?.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{selectedBooking.room?.name}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <CalendarMonth color="action" sx={{ mr: 1, mt: 0.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">DATES</Typography>
                        <Typography variant="body2"><strong>Check-in:</strong> {formatDate(selectedBooking.check_in)}</Typography>
                        <Typography variant="body2"><strong>Check-out:</strong> {formatDate(selectedBooking.check_out)}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid xs={12}>
                    <Divider />
                  </Grid>

                  <Grid xs={12} sm={6}>
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

                  <Grid xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
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

            {/* MODIFIED: Replaced Print button with Export buttons */}
            <DialogActions sx={{ p: 3, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', flexWrap: 'wrap', gap: 1 }}>
              <Button onClick={handleCloseVoucher} color="inherit" sx={{ mr: 'auto' }}>
                Close
              </Button>
              <Button 
                onClick={handleExportTXT} 
                variant="outlined" 
                startIcon={<Description />}
              >
                TXT
              </Button>
              <Button 
                onClick={handleExportPDF} 
                variant="contained" 
                startIcon={isExporting ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdf />}
                disabled={isExporting}
              >
                {isExporting ? 'Generating PDF...' : 'Export PDF'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};
