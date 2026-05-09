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
import { CheckCircle, Cancel, Pending, Visibility, Download } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';

const downloadCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) return toast.error('No data available to export');
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => headers.map(fieldName => {
      let val = row[fieldName] === null || row[fieldName] === undefined ? '' : String(row[fieldName]);
      val = val.replace(/"/g, '""');
      if (val.search(/("|,|\n)/g) >= 0) val = `"${val}"`;
      return val;
    }).join(','))
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const ReservationManagement = () => {
  const { bookings, updateBookingStatus } = useApp();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Use 'any' to bypass strict TS checking for Supabase joined nested objects
  const filteredBookings =
    activeTab === 0
      ? bookings
      : activeTab === 1
      ? bookings.filter((b: any) => b.status === 'pending')
      : activeTab === 2
      ? bookings.filter((b: any) => b.status === 'confirmed' || b.status === 'approved')
      : bookings.filter((b: any) => b.status === 'cancelled');

  const handleExportCSV = () => {
    // Standardize object for cleaner CSV output using actual Supabase snake_case fields
    const exportData = filteredBookings.map((b: any) => ({
      BookingID: b.id,
      RoomName: b.rooms?.name || 'N/A',
      HotelName: b.rooms?.hotel?.name || 'N/A',
      CheckIn: b.check_in ? new Date(b.check_in).toLocaleDateString() : 'N/A',
      CheckOut: b.check_out ? new Date(b.check_out).toLocaleDateString() : 'N/A',
      Guests: b.guests || 1,
      TotalPrice: `$${(b.total_price || 0).toFixed(2)}`,
      Status: b.status ? b.status.toUpperCase() : 'UNKNOWN',
      BookedOn: b.created_at ? new Date(b.created_at).toLocaleDateString() : 'N/A'
    }));
    
    const statusLabel = activeTab === 0 ? 'All' : activeTab === 1 ? 'Pending' : activeTab === 2 ? 'Confirmed' : 'Cancelled';
    downloadCSV(exportData, `Reservations_Export_${statusLabel}`);
    toast.success('Reservations exported to CSV');
  };

  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking);
    setDetailsDialog(true);
  };

  const handleApprove = (bookingId: string) => {
    updateBookingStatus(bookingId, 'confirmed'); // Changed from 'approved' to match DB schema
    toast.success('Reservation confirmed successfully');
    setDetailsDialog(false);
  };

  const handleCancel = (bookingId: string) => {
    updateBookingStatus(bookingId, 'cancelled');
    toast.success('Reservation cancelled');
    setDetailsDialog(false);
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'approved':
        return <Chip icon={<CheckCircle />} label="Confirmed" color="success" size="small" />;
      case 'pending':
        return <Chip icon={<Pending />} label="Pending" color="warning" size="small" />;
      case 'cancelled':
        return <Chip icon={<Cancel />} label="Cancelled" color="error" size="small" />;
      default:
        return <Chip label={status || 'Unknown'} size="small" />;
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
      value: bookings.filter((b: any) => b.status === 'pending').length,
      color: '#F59E0B',
    },
    {
      label: 'Confirmed',
      value: bookings.filter((b: any) => b.status === 'confirmed' || b.status === 'approved').length,
      color: '#10B981',
    },
    {
      label: 'Cancelled',
      value: bookings.filter((b: any) => b.status === 'cancelled').length,
      color: '#EF4444',
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Reservation Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage all hotel reservations
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Download />} onClick={handleExportCSV}>
          Export Reservations
        </Button>
      </Box>

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
              <TableCell><Typography fontWeight={600}>Booking ID</Typography></TableCell>
              <TableCell><Typography fontWeight={600}>Room</Typography></TableCell>
              <TableCell><Typography fontWeight={600}>Hotel</Typography></TableCell>
              <TableCell><Typography fontWeight={600}>Check-in</Typography></TableCell>
              <TableCell><Typography fontWeight={600}>Check-out</Typography></TableCell>
              <TableCell><Typography fontWeight={600}>Guests</Typography></TableCell>
              <TableCell><Typography fontWeight={600}>Total</Typography></TableCell>
              <TableCell><Typography fontWeight={600}>Status</Typography></TableCell>
              <TableCell><Typography fontWeight={600}>Actions</Typography></TableCell>
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
              filteredBookings.map((booking: any) => (
                <TableRow key={booking.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {booking.id.split('-')[0].toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{booking.rooms?.name || 'N/A'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {booking.rooms?.hotel?.name || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {booking.check_in ? new Date(booking.check_in).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {booking.check_out ? new Date(booking.check_out).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{booking.guests || 1}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      ${(booking.total_price || 0).toFixed(2)}
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
                    {selectedBooking.rooms?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedBooking.rooms?.hotel?.name || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Check-in
                  </Typography>
                  <Typography variant="body1">
                    {selectedBooking.check_in ? new Date(selectedBooking.check_in).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Check-out
                  </Typography>
                  <Typography variant="body1">
                    {selectedBooking.check_out ? new Date(selectedBooking.check_out).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Guests
                  </Typography>
                  <Typography variant="body1">{selectedBooking.guests || 1}</Typography>
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
                      ${(selectedBooking.total_price || 0).toFixed(2)}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Booked on: {selectedBooking.created_at ? new Date(selectedBooking.created_at).toLocaleString() : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 2 }}>
              <Button onClick={() => setDetailsDialog(false)}>Close</Button>
              {selectedBooking.status === 'pending' && (
                <>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleCancel(selectedBooking.id)}
                  >
                    Reject
                  </Button>
                  <Button variant="contained" onClick={() => handleApprove(selectedBooking.id)}>
                    Confirm
                  </Button>
                </>
              )}
              {selectedBooking.status === 'confirmed' && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleCancel(selectedBooking.id)}
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