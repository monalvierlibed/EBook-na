import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Card,
  CardMedia,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  // Add these 3 new imports:
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import { CheckCircle, CalendarMonth, Person } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { supabase, RoomWithHotel } from '../../../lib/supabase';
import { toast } from 'sonner';

// @ts-ignore - Material-UI Grid v7 has typing issues with item prop
const GridItem = Grid as any;

export const Booking = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { createBooking } = useApp();
  const { user, profile } = useAuth();

  const [room, setRoom] = useState<RoomWithHotel | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    specialRequests: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  // Add these inside your component
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          hotel:hotels(*)
        `)
        .eq('id', roomId || '') // Fix: Ensure it's treated as a string for strict TS
        .single();

      if (!error && data) {
        setRoom(data);
      }
      setLoading(false);
    };

    if (roomId) {
      fetchRoom();
    }
  }, [roomId]);

  // Pre-fill form with user data
  useEffect(() => {
    if (user || profile) {
      const fullName = profile?.full_name || user?.user_metadata?.full_name || '';
      const nameParts = fullName.split(' ');
      
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user?.email || '',
        phone: profile?.phone || '',
      }));
    }
  }, [user, profile]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!room) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5">Room not found</Typography>
        <Button variant="contained" onClick={() => navigate('/search')} sx={{ mt: 2 }}>
          Back to Search
        </Button>
      </Container>
    );
  }

  const calculateNights = () => {
    if (formData.checkIn && formData.checkOut) {
      const start = new Date(formData.checkIn);
      const end = new Date(formData.checkOut);
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return nights > 0 ? nights : 1;
    }
    return 1;
  };

  const nights = calculateNights();
  const subtotal = room.price_per_night * nights;
  const serviceFee = subtotal * 0.1;
  const taxes = subtotal * 0.12; // 12% VAT in Philippines
  const total = subtotal + serviceFee + taxes;

  const validatePaymentDetails = () => {
    // If they chose GCash, we skip the card validation
    if (paymentMethod === 'gcash') {
      return true; // You can add phone number validation here later if you want
    }

    // If they chose Card, run the strict validation
    if (paymentMethod === 'card') {
      if (!paymentDetails.cardName.trim()) {
        toast.error('Please enter the cardholder name');
        return false;
      }

      const cleanedNumber = paymentDetails.cardNumber.replace(/\s+/g, '');
      if (!/^\d{16}$/.test(cleanedNumber)) {
        toast.error('Please enter a valid 16-digit card number');
        return false;
      }

      if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(paymentDetails.expiry)) {
        toast.error('Please enter expiry in MM/YY format');
        return false;
      }

      if (!/^\d{3,4}$/.test(paymentDetails.cvv)) {
        toast.error('Please enter a valid CVV');
        return false;
      }
    }

    return true;
  };

  const simulateMockPayment = async () => {
    setPaymentProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setPaymentProcessing(false);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to book a room');
      navigate('/auth/login');
      return;
    }

    if (!formData.checkIn || !formData.checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    if (!validatePaymentDetails()) {
      return;
    }

    setSubmitting(true);

    const paymentSuccess = await simulateMockPayment();
    if (!paymentSuccess) {
      toast.error('Mock payment failed. Please verify your details and try again.');
      setSubmitting(false);
      return;
    }

    const { error } = await createBooking({
      room_id: room.id,
      check_in: formData.checkIn,
      check_out: formData.checkOut,
      guests: formData.guests,
      total_price: total,
      status: 'confirmed',
      special_requests: formData.specialRequests || null,
    });

    if (error) {
      toast.error(error.message);
      setSubmitting(false);
    } else {
      toast.success(`Payment successful via ${paymentMethod.toUpperCase()}! Your booking is confirmed.`);
      setBookingId(`EBOK-${Date.now().toString(36).toUpperCase()}`);
      setShowConfirmation(true);
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Complete Your Booking
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Review your selection and enter guest details
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          <GridItem item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Guest Information
              </Typography>

              <Grid container spacing={2}>
                <GridItem item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  />
                </GridItem>
                <GridItem item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  />
                </GridItem>
                <GridItem item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  />
                </GridItem>
                <GridItem item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    placeholder="+63"
                  />
                </GridItem>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Booking Details
              </Typography>

              <Grid container spacing={2}>
                <GridItem item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Check-in Date"
                    name="checkIn"
                    type="date"
                    value={formData.checkIn}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                    required
                    disabled={submitting}
                  />
                </GridItem>
                <GridItem item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Check-out Date"
                    name="checkOut"
                    type="date"
                    value={formData.checkOut}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: formData.checkIn || new Date().toISOString().split('T')[0] }}
                    required
                    disabled={submitting}
                  />
                </GridItem>
                <GridItem item xs={12}>
                  <FormControl fullWidth disabled={submitting}>
                    <InputLabel>Number of Guests</InputLabel>
                    <Select
                      value={formData.guests}
                      label="Number of Guests"
                      onChange={(e) => setFormData({ ...formData, guests: e.target.value as number })}
                    >
                      {/* Fix: safely handle undefined capacity by defaulting to 1 */}
                      {Array.from({ length: room.capacity || 1 }, (_, i) => i + 1).map((num) => (
                        <MenuItem key={num} value={num}>
                          {num} {num === 1 ? 'Guest' : 'Guests'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </GridItem>
                <GridItem item xs={12}>
                  <TextField
                    fullWidth
                    label="Special Requests (Optional)"
                    name="specialRequests"
                    multiline
                    rows={3}
                    value={formData.specialRequests}
                    onChange={handleChange}
                    disabled={submitting}
                    placeholder="E.g., early check-in, extra pillows, dietary requirements..."
                  />
                </GridItem>
              </Grid>
            </Paper>
          </GridItem>

          <GridItem item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Your Selection
              </Typography>

              <Card sx={{ mb: 2 }}>
                <CardMedia 
                  component="img" 
                  height="120" 
                  image={room.images?.[0] || room.hotel?.images?.[0] || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'} 
                  alt={room.name} 
                />
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {room.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {room.hotel?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {room.hotel?.city}, {room.hotel?.province}
                  </Typography>
                </CardContent>
              </Card>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarMonth sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {nights} {nights === 1 ? 'Night' : 'Nights'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {formData.guests} {formData.guests === 1 ? 'Guest' : 'Guests'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ bgcolor: '#F1F5F9', p: 2, borderRadius: 2, mb: 3 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Payment Summary
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    {formatPrice(room.price_per_night)} x {nights} nights
                  </Typography>
                  <Typography variant="body2">{formatPrice(subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Service Fee</Typography>
                  <Typography variant="body2">{formatPrice(serviceFee)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">VAT (12%)</Typography>
                  <Typography variant="body2">{formatPrice(taxes)}</Typography>
                </Box>
                <Box sx={{ borderTop: '1px solid #CBD5E1', pt: 1, mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" fontWeight={700}>
                      Total
                    </Typography>
                    <Typography variant="body1" fontWeight={700} color="primary.main">
                      {formatPrice(total)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* --- NEW DEMO PAYMENT SECTION --- */}
              <Box sx={{ p: 3, mb: 3, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#FAFAF9' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Payment Method (Demo)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No real money will be charged. This is a simulated transaction.
                </Typography>

                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  {/* GCash Option */}
                  <FormControlLabel 
                    value="gcash" 
                    control={<Radio color="primary" />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography fontWeight={500}>GCash</Typography>
                        <Typography variant="caption" sx={{ bgcolor: '#007DFE', color: 'white', px: 1, py: 0.5, borderRadius: 1 }}>
                          Recommended
                        </Typography>
                      </Box>
                    } 
                  />
                  {paymentMethod === 'gcash' && (
                    <Box sx={{ ml: 4, mt: 1, mb: 2 }}>
                      <TextField 
                        fullWidth 
                        size="small" 
                        label="GCash Mobile Number" 
                        placeholder="09XX XXX XXXX" 
                        disabled={submitting}
                      />
                    </Box>
                  )}

                  {/* Credit Card Option */}
                  <FormControlLabel 
                    value="card" 
                    control={<Radio color="primary" />} 
                    label={<Typography fontWeight={500}>Credit / Debit Card</Typography>} 
                  />
                  {paymentMethod === 'card' && (
                    <Box sx={{ ml: 4, mt: 1, mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField 
                        fullWidth 
                        size="small" 
                        label="Card Number" 
                        name="cardNumber"
                        value={paymentDetails.cardNumber}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                        placeholder="1234 5678 9012 3456" 
                        disabled={submitting}
                      />
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField 
                          fullWidth 
                          size="small" 
                          label="Expiry (MM/YY)" 
                          name="expiry"
                          value={paymentDetails.expiry}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, expiry: e.target.value })}
                          disabled={submitting}
                        />
                        <TextField 
                          fullWidth 
                          size="small" 
                          label="CVV" 
                          name="cvv"
                          value={paymentDetails.cvv}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                          disabled={submitting}
                        />
                      </Box>
                    </Box>
                  )}
                </RadioGroup>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{ py: 1.5, fontSize: '1.1rem' }}
              >
                {submitting ? 'Processing Payment...' : 'Pay & Confirm Booking'}
              </Button>
              {/* ---------------------------------- */}
            </Paper>
          </GridItem>
        </Grid>
      </form>

      {/* Fix: Added dummy onClose to satisfy strict DialogProps rules */}
      <Dialog open={showConfirmation} onClose={() => {}} maxWidth="sm" fullWidth disableEscapeKeyDown>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <DialogTitle sx={{ p: 0, mb: 1 }}>
            <Typography variant="h5" fontWeight={700}>
              Booking Confirmed!
            </Typography>
          </DialogTitle>
          <Typography variant="body1" color="text.secondary" paragraph>
            Salamat! Your booking has been successfully placed.
          </Typography>
          
          <Paper sx={{ bgcolor: '#F1F5F9', p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Booking Reference
            </Typography>
            <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
              {bookingId}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                Booking Summary
              </Typography>
              
              {/* Fix: Changed to integer spacing (2) as some strict MUI versions reject float grid spacing */}
              <Grid container spacing={2}>
                <GridItem item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Hotel</Typography>
                  <Typography variant="body2" fontWeight={600}>{room?.hotel?.name}</Typography>
                </GridItem>
                <GridItem item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Room</Typography>
                  <Typography variant="body2" fontWeight={600}>{room?.name}</Typography>
                </GridItem>
                <GridItem item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Check-in</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatDate(formData.checkIn)}</Typography>
                </GridItem>
                <GridItem item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Check-out</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatDate(formData.checkOut)}</Typography>
                </GridItem>
                <GridItem item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Guests</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formData.guests} {formData.guests === 1 ? 'Guest' : 'Guests'} ({nights} {nights === 1 ? 'Night' : 'Nights'})
                  </Typography>
                </GridItem>
                <GridItem item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">Total Amount Paid</Typography>
                  <Typography variant="body1" fontWeight={700} color="success.main">
                    {formatPrice(total)}
                  </Typography>
                </GridItem>
              </Grid>
            </Box>
          </Paper>
          
          <Typography variant="body2" color="text.secondary">
            A confirmation email has been sent to <strong>{formData.email}</strong>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 4, px: 4, gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/search')} sx={{ flex: 1 }}>
            Browse More Hotels
          </Button>
          <Button variant="contained" onClick={() => navigate('/bookings')} sx={{ flex: 1 }}>
            View My Bookings
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
