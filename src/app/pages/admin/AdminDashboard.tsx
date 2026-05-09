import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
} from '@mui/material';
import {
  AttachMoney,
  Hotel,
  People,
  BookOnline,
  Sensors,
} from '@mui/icons-material';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

interface DashboardMetrics {
  totalRevenue: number;
  totalBookings: number;
  totalRooms: number;
  totalCustomers: number;
}

interface RecentBooking {
  id: string;
  created_at: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  check_in: string;
  check_out: string;
  profiles: { full_name: string; email: string } | null;
  rooms: { name: string; hotel: { name: string } } | null;
}

export const AdminDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    totalBookings: 0,
    totalRooms: 0,
    totalCustomers: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Total Revenue & Bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('total_price, status');
      
      if (bookingsError) throw bookingsError;

      const revenue = bookingsData
        .filter(b => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, b) => sum + (b.total_price || 0), 0);

      // 2. Fetch Total Rooms
      const { count: roomsCount, error: roomsError } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true });
      if (roomsError) throw roomsError;

      // 3. Fetch Total Customers (Profiles)
      const { count: customersCount, error: customersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (customersError) throw customersError;

      // 4. Fetch Recent Bookings for Table
      const { data: recentData, error: recentError } = await supabase
        .from('bookings')
        .select(`
          id, created_at, total_price, status, check_in, check_out,
          profiles(full_name, email),
          rooms(name, hotel:hotels(name))
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      if (recentError) throw recentError;

      setMetrics({
        totalRevenue: revenue,
        totalBookings: bookingsData.length,
        totalRooms: roomsCount || 0,
        totalCustomers: customersCount || 0,
      });

      // @ts-ignore - Supabase join typings can be overly strict
      setRecentBookings(recentData as RecentBooking[]);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to sync dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Set up Real-Time Subscriptions
    const channel = supabase
      .channel('admin-dashboard-sync')
      // Listen to Bookings (Revenue & Recent Table)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          setIsLive(true);
          fetchDashboardData(); // Re-fetch to ensure calculation accuracy on changes
          
          if (payload.eventType === 'INSERT') {
            toast.success('New booking received!', { description: 'Dashboard updated.' });
          } else if (payload.eventType === 'UPDATE') {
            toast.info('A booking was updated.', { description: 'Revenue metrics recalculated.' });
          }
          setTimeout(() => setIsLive(false), 2000);
        }
      )
      // Listen to Rooms (Total Active Rooms)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        () => {
          setIsLive(true);
          fetchDashboardData();
          setTimeout(() => setIsLive(false), 2000);
        }
      )
      // Listen to Profiles (Total Customers)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        () => {
          setIsLive(true);
          fetchDashboardData();
          toast.success('New user registered!', { description: 'Customer count updated.' });
          setTimeout(() => setIsLive(false), 2000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'warning';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) => (
    <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', borderRadius: 3 }}>
      <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, width: 56, height: 56, mr: 2 }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={700}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Admin Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overview of your hotel operations and revenue
          </Typography>
        </Box>
        
        <Chip 
          icon={<Sensors sx={{ fontSize: 18 }} />} 
          label={isLive ? "Syncing..." : "Live"} 
          color={isLive ? "primary" : "success"}
          variant="outlined"
          sx={{ 
            fontWeight: 600, 
            transition: 'all 0.3s ease',
            bgcolor: isLive ? 'primary.50' : 'success.50' 
          }} 
        />
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item component="div" component="div" xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Revenue" 
            value={formatPrice(metrics.totalRevenue)} 
            icon={<AttachMoney fontSize="large" />} 
            color="success" 
          />
        </Grid>
        <Grid item component="div" xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Bookings" 
            value={metrics.totalBookings} 
            icon={<BookOnline fontSize="large" />} 
            color="primary" 
          />
        </Grid>
        <Grid item component="div" xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Rooms" 
            value={metrics.totalRooms} 
            icon={<Hotel fontSize="large" />} 
            color="warning" 
          />
        </Grid>
        <Grid item component="div" xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Customers" 
            value={metrics.totalCustomers} 
            icon={<People fontSize="large" />} 
            color="info" 
          />
        </Grid>
      </Grid>

      {/* Recent Bookings Feed */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #E2E8F0' }}>
          <Typography variant="h6" fontWeight={600}>
            Recent Live Bookings
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell>Booking ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Hotel / Room</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No recent bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                recentBookings.map((booking) => (
                  <TableRow key={booking.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {booking.id.split('-')[0].toUpperCase()}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {booking.profiles?.full_name || 'Unknown User'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {booking.profiles?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {booking.rooms?.hotel?.name || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {booking.rooms?.name || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(booking.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                        {new Date(booking.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatPrice(booking.total_price)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)} 
                        color={getStatusColor(booking.status) as any}
                        size="small"
                        sx={{ fontWeight: 600, minWidth: 90 }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};
