import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import { CheckCircle, Cancel, Pending, Visibility } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { BookingWithDetails } from '../../../lib/supabase';
import { toast } from 'sonner';

export const ReservationManagement = () => {
  const { bookings, updateBookingStatus } = useApp();
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const filteredBookings =
    activeTab === 0
      ? bookings
      : activeTab === 1
      ? bookings.filter((b) => b.status === 'pending')
      : activeTab === 2
      ? bookings.filter((b) => b.status === 'confirmed')
      : bookings.filter((b) => b.status === 'cancelled');

  const handleViewDetails = (booking: BookingWithDetails) => {
    setSelectedBooking(booking);
    setDetailsDialog(true);
  };

  const handleApprove = async (bookingId: string) => {
    setUpdatingStatus(true);
    const { error } = await updateBookingStatus(bookingId, 'confirmed');
    if (error) {
      toast.error(error.message);
      setUpdatingStatus(false);
      return;
    }
    toast.success('Reservation approved successfully');
    setDetailsDialog(false);
    setUpdatingStatus(false);
  };

  const handleCancel = async (bookingId: string) => {
    setUpdatingStatus(true);
    const { error } = await updateBookingStatus(bookingId, 'cancelled');
    if (error) {
      toast.error(error.message);
      setUpdatingStatus(false);
      return;
    }
    toast.success('Reservation cancelled');
    setDetailsDialog(false);
    setUpdatingStatus(false);
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Chip icon={<CheckCircle />} label="Confirmed" color="success" size="small" />;
      case 'pending':
        return <Chip icon={<Pending />} label="Pending" color="warning" size="small" />;
      case 'cancelled':
        return <Chip icon={<Cancel />} label="Cancelled" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const stats = [
    {
      label: 'Total Reservations',
      value: bookings.length,
      color: '#3B82F6',
    },
    {
      label: 'Pending',
      value: bookings.filter((b) => b.status === 'pending').length,
      color: '#F59E0B',
    },
    {
      label: 'Approved',
      value: bookings.filter((b) => b.status === 'confirmed').length,
      color: '#10B981',
    },
    {
      label: 'Cancelled',
      value: bookings.filter((b) => b.status === 'cancelled').length,
      color: '#EF4444',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Reservation Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View and manage all hotel reservations
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ borderLeft: `4px solid ${stat.color}` }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {stat.label}
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="All Reservations" />
          <Tab label="Pending" />
          <Tab label="Confirmed" />
          <Tab label="Cancelled" />
        </Tabs>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              <TableCell>
                <Typography fontWeight={600}>Booking ID</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={600}>Room</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={600}>Hotel</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={600}>Check-in</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={600}>Check-out</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={600}>Guests</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={600}>Total</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={600}>Status</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={600}>Actions</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No reservations found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {booking.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{booking.room?.name || 'N/A'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {booking.room?.hotel?.name || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(booking.check_in).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(booking.check_out).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{booking.guests}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      ₱{booking.total_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(booking.status)}</TableCell>
                  <TableCell>
                    <IconButton size="small" color="primary" onClick={() => handleViewDetails(booking)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="sm" fullWidth>
        {selectedBooking && (
          <>
            <DialogTitle>
              <Typography variant="h6" fontWeight={600}>
                Reservation Details
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: '#F8FAFC' }}>
                    <Typography variant="caption" color="text.secondary">
                      Booking ID
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedBooking.id}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Room Information
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedBooking.room?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedBooking.room?.hotel?.name || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Check-in
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedBooking.check_in).toLocaleDateString()}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Check-out
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedBooking.check_out).toLocaleDateString()}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Guests
                  </Typography>
                  <Typography variant="body1">{selectedBooking.guests}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Status
                  </Typography>
                  {getStatusChip(selectedBooking.status)}
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: '#EFF6FF' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Total Amount
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      ₱{selectedBooking.total_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Booked on: {new Date(selectedBooking.created_at).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 2 }}>
              <Button onClick={() => setDetailsDialog(false)} disabled={updatingStatus}>Close</Button>
              {selectedBooking.status === 'pending' && (
                <>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleCancel(selectedBooking.id)}
                    disabled={updatingStatus}
                  >
                    Reject
                  </Button>
                  <Button variant="contained" onClick={() => handleApprove(selectedBooking.id)} disabled={updatingStatus}>
                    Approve
                  </Button>
                </>
              )}
              {selectedBooking.status === 'confirmed' && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleCancel(selectedBooking.id)}
                  disabled={updatingStatus}
                >
                  Cancel Reservation
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
