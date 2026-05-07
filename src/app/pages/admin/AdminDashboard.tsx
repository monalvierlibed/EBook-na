import { Box, Typography, Grid, Paper, Card, CardContent } from '@mui/material';
import {
  TrendingUp,
  People,
  Hotel,
  AttachMoney,
  CheckCircle,
  Pending,
  Block,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useApp } from '../../context/AppContext';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export const AdminDashboard = () => {
  const { bookings, rooms } = useApp();

  const totalBookings = bookings.length;
  const approvedBookings = bookings.filter((b) => b.status === 'approved').length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
  const totalRevenue = bookings
    .filter((b) => b.status === 'approved')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const availableRooms = rooms.filter((r) => r.available).length;
  const occupiedRooms = rooms.filter((r) => !r.available).length;

  const uniqueCustomers = new Set(bookings.map((b) => b.id.substring(2, 8))).size;

  const stats = [
    {
      title: 'Total Bookings',
      value: totalBookings,
      icon: <Hotel sx={{ fontSize: 40 }} />,
      color: '#3B82F6',
      bgColor: '#EFF6FF',
    },
    {
      title: 'Total Customers',
      value: uniqueCustomers,
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#10B981',
      bgColor: '#F0FDF4',
    },
    {
      title: 'Available Rooms',
      value: availableRooms,
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      color: '#F59E0B',
      bgColor: '#FFFBEB',
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toFixed(0)}`,
      icon: <AttachMoney sx={{ fontSize: 40 }} />,
      color: '#8B5CF6',
      bgColor: '#F5F3FF',
    },
  ];

  const monthlyData = [
    { month: 'Jan', bookings: 45, revenue: 12500 },
    { month: 'Feb', bookings: 52, revenue: 14200 },
    { month: 'Mar', bookings: 61, revenue: 16800 },
    { month: 'Apr', bookings: 58, revenue: 15900 },
    { month: 'May', bookings: 67, revenue: 18400 },
  ];

  const roomTypeData = [
    { name: 'Standard', value: rooms.filter((r) => r.type === 'Standard').length },
    { name: 'Deluxe', value: rooms.filter((r) => r.type === 'Deluxe').length },
    { name: 'Suite', value: rooms.filter((r) => r.type === 'Suite').length },
    { name: 'Villa', value: rooms.filter((r) => r.type === 'Villa').length },
  ];

  const bookingStatusData = [
    { name: 'Approved', value: approvedBookings },
    { name: 'Pending', value: pendingBookings },
    { name: 'Cancelled', value: bookings.filter((b) => b.status === 'cancelled').length },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Dashboard Overview
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome back! Here's what's happening with your hotel.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card sx={{ bgcolor: stat.bgColor, border: 'none', boxShadow: 'none' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Monthly Bookings & Revenue
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="bookings" fill="#3B82F6" name="Bookings" />
                <Bar yAxisId="right" dataKey="revenue" fill="#10B981" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Room Availability
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                  <Typography variant="body2">Available</Typography>
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  {availableRooms}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Block sx={{ color: 'error.main', mr: 1 }} />
                  <Typography variant="body2">Occupied</Typography>
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  {occupiedRooms}
                </Typography>
              </Box>

              <Box sx={{ bgcolor: '#F1F5F9', p: 2, borderRadius: 2, mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Occupancy Rate
                </Typography>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {rooms.length > 0 ? ((occupiedRooms / rooms.length) * 100).toFixed(1) : 0}%
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Room Types Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={roomTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roomTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Booking Status
            </Typography>
            <Box sx={{ mt: 3 }}>
              {bookingStatusData.map((status, index) => (
                <Box
                  key={status.name}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    p: 2,
                    bgcolor: '#F8FAFC',
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {status.name === 'Approved' && <CheckCircle sx={{ color: 'success.main', mr: 1 }} />}
                    {status.name === 'Pending' && <Pending sx={{ color: 'warning.main', mr: 1 }} />}
                    {status.name === 'Cancelled' && <Block sx={{ color: 'error.main', mr: 1 }} />}
                    <Typography variant="body1">{status.name}</Typography>
                  </Box>
                  <Typography variant="h6" fontWeight={700}>
                    {status.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
