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
  Chip,
  Divider,
} from '@mui/material';
import { CheckCircle, CalendarMonth, Person, LocalOffer } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { supabase, RoomWithHotel } from '../../../lib/supabase';
import { toast } from 'sonner';

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
    promoCode: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          hotel:hotels(*)
        `)
        .eq('id', roomId)
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
  const promoCodeNormalized = formData.promoCode.trim().toUpperCase();
  const promoDiscountRate =
    promoCodeNormalized === 'SUMMER10' ? 0.1 :
    promoCodeNormalized === 'WELCOME5' ? 0.05 :
    0;
  const promoDiscount = subtotal * promoDiscountRate;
  const total = subtotal + serviceFee + taxes - promoDiscount;

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const now = new Date().toISOString().split('T')[0];

    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Enter a valid email address';
    }
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.checkIn) errors.checkIn = 'Check-in date is required';
    if (!formData.checkOut) errors.checkOut = 'Check-out date is required';
    if (formData.checkIn && formData.checkIn < now) {
      errors.checkIn = 'Check-in date cannot be in the past';
    }
    if (formData.checkIn && formData.checkOut && formData.checkOut <= formData.checkIn) {
      errors.checkOut = 'Check-out date must be later than check-in date';
    }
    if (formData.guests < 1 || formData.guests > room.capacity) {
      errors.guests = `Guests must be between 1 and ${room.capacity}`;
    }
    if (promoCodeNormalized && promoDiscountRate === 0) {
      errors.promoCode = 'Invalid promo code. Try SUMMER10 or WELCOME5';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to book a room');
      navigate('/auth/login');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    setSubmitting(true);

    const { error } = await createBooking({
      room_id: room.id,
      check_in: formData.checkIn,
      check_out: formData.checkOut,
      guests: formData.guests,
      total_price: total,
      status: 'pending',
      special_requests: formData.specialRequests || null,
    });

    if (error) {
      toast.error(error.message);
      setSubmitting(false);
    } else {
      setBookingId(`BK-${Date.now().toString(36).toUpperCase()}`);
      setConfirmationNumber(`CNF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
      setShowConfirmation(true);
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
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
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Guest Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    error={Boolean(fieldErrors.firstName)}
                    helperText={fieldErrors.firstName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    error={Boolean(fieldErrors.lastName)}
                    helperText={fieldErrors.lastName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    error={Boolean(fieldErrors.email)}
                    helperText={fieldErrors.email}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    placeholder="+63"
                    error={Boolean(fieldErrors.phone)}
                    helperText={fieldErrors.phone}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Booking Details
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
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
                    error={Boolean(fieldErrors.checkIn)}
                    helperText={fieldErrors.checkIn}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
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
                    error={Boolean(fieldErrors.checkOut)}
                    helperText={fieldErrors.checkOut}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth disabled={submitting}>
                    <InputLabel>Number of Guests</InputLabel>
                    <Select
                      value={formData.guests}
                      label="Number of Guests"
                      onChange={(e) => setFormData({ ...formData, guests: e.target.value as number })}
                    >
                      {Array.from({ length: room.capacity }, (_, i) => i + 1).map((num) => (
                        <MenuItem key={num} value={num}>
                          {num} {num === 1 ? 'Guest' : 'Guests'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {fieldErrors.guests && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {fieldErrors.guests}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
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
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
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

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Room amenities
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {(room.amenities || []).slice(0, 6).map((amenity) => (
                    <Chip key={amenity} size="small" variant="outlined" label={amenity} />
                  ))}
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
                {promoDiscount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="success.main">
                      Promo Discount ({promoCodeNormalized})
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      -{formatPrice(promoDiscount)}
                    </Typography>
                  </Box>
                )}
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

              <TextField
                fullWidth
                label="Promo Code"
                name="promoCode"
                value={formData.promoCode}
                onChange={handleChange}
                disabled={submitting}
                placeholder="Try SUMMER10 or WELCOME5"
                error={Boolean(fieldErrors.promoCode)}
                helperText={fieldErrors.promoCode || 'Optional discount code'}
                InputProps={{
                  startAdornment: <LocalOffer sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />,
                }}
                sx={{ mb: 2 }}
              />

              <Button 
                fullWidth 
                variant="contained" 
                size="large" 
                type="submit"
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {submitting ? 'Processing...' : 'Confirm Booking'}
              </Button>

              <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 2 }}>
                Free cancellation within 24 hours
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </form>

      <Dialog open={showConfirmation} maxWidth="sm" fullWidth>
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
          <Paper sx={{ bgcolor: '#F1F5F9', p: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>Booking ID</Typography>
            <Typography variant="h6" fontWeight={600}>{bookingId}</Typography>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="body2" color="text.secondary" gutterBottom>Confirmation Number</Typography>
            <Typography variant="h6" fontWeight={600}>{confirmationNumber}</Typography>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="body2" color="text.secondary">
              {room.name} at {room.hotel?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formData.checkIn} to {formData.checkOut} ({nights} nights) - {formData.guests} guest(s)
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1 }}>
              Total Paid: {formatPrice(total)}
            </Typography>
          </Paper>
          <Typography variant="body2" color="text.secondary">
            A confirmation email has been sent to {formData.email}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button variant="outlined" onClick={() => navigate('/search')}>
            Browse More Hotels
          </Button>
          <Button variant="contained" onClick={() => navigate('/bookings')}>
            View My Bookings
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
