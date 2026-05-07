import { useState } from 'react';
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
} from '@mui/material';
import { CheckCircle, CalendarMonth, Person } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';

export const Booking = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { rooms, user, addBooking } = useApp();

  const room = rooms.find((r) => r.id === roomId);

  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    specialRequests: '',
    firstName: user?.name.split(' ')[0] || '',
    lastName: user?.name.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingId, setBookingId] = useState('');

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
  const subtotal = room.price * nights;
  const serviceFee = subtotal * 0.1;
  const taxes = subtotal * 0.08;
  const total = subtotal + serviceFee + taxes;

  const handleSubmit = (e: React.FormEvent) => {
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

    const newBookingId = `BK${Date.now()}`;
    setBookingId(newBookingId);

    const booking = {
      id: newBookingId,
      roomId: room.id,
      roomName: room.name,
      hotelName: room.hotelName,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      guests: formData.guests,
      totalPrice: total,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    addBooking(booking);
    setShowConfirmation(true);
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
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Number of Guests</InputLabel>
                    <Select
                      value={formData.guests}
                      label="Number of Guests"
                      onChange={(e) => setFormData({ ...formData, guests: e.target.value as number })}
                    >
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <MenuItem key={num} value={num}>
                          {num} {num === 1 ? 'Guest' : 'Guests'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
                <CardMedia component="img" height="120" image={room.image} alt={room.name} />
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {room.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {room.hotelName}
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
                    ${room.price} x {nights} nights
                  </Typography>
                  <Typography variant="body2">${subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Service Fee</Typography>
                  <Typography variant="body2">${serviceFee.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Taxes</Typography>
                  <Typography variant="body2">${taxes.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ borderTop: '1px solid #CBD5E1', pt: 1, mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" fontWeight={700}>
                      Total
                    </Typography>
                    <Typography variant="body1" fontWeight={700} color="primary.main">
                      ${total.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Button fullWidth variant="contained" size="large" type="submit">
                Confirm Booking
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
            Your booking has been successfully placed.
          </Typography>
          <Paper sx={{ bgcolor: '#F1F5F9', p: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Booking ID
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {bookingId}
            </Typography>
          </Paper>
          <Typography variant="body2" color="text.secondary">
            A confirmation email has been sent to {formData.email}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button variant="outlined" onClick={() => navigate('/search')}>
            Browse More Rooms
          </Button>
          <Button variant="contained" onClick={() => navigate('/bookings')}>
            View My Bookings
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
