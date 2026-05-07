import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Download, TrendingUp, AttachMoney, People, Hotel } from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';

export const Reports = () => {
  const { bookings, rooms } = useApp();

  const totalRevenue = bookings
    .filter((b) => b.status === 'approved')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const monthlyRevenue = [
    { month: 'Jan', revenue: 12500, bookings: 45 },
    { month: 'Feb', revenue: 14200, bookings: 52 },
    { month: 'Mar', revenue: 16800, bookings: 61 },
    { month: 'Apr', revenue: 15900, bookings: 58 },
    { month: 'May', revenue: 18400, bookings: 67 },
  ];

  const performanceData = [
    { metric: 'Average Booking Value', value: `$${(totalRevenue / (bookings.length || 1)).toFixed(2)}` },
    { metric: 'Occupancy Rate', value: `${((rooms.filter(r => !r.available).length / rooms.length) * 100).toFixed(1)}%` },
    { metric: 'Total Bookings', value: bookings.length },
    { metric: 'Approved Bookings', value: bookings.filter(b => b.status === 'approved').length },
    { metric: 'Pending Bookings', value: bookings.filter(b => b.status === 'pending').length },
    { metric: 'Cancellation Rate', value: `${((bookings.filter(b => b.status === 'cancelled').length / (bookings.length || 1)) * 100).toFixed(1)}%` },
  ];

  const handleExport = (type: string) => {
    toast.success(`${type} report exported successfully`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Reports & Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive business insights and performance metrics
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Download />} onClick={() => handleExport('Full')}>
          Export All Reports
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#EFF6FF', border: 'none', boxShadow: 'none' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    ${totalRevenue.toFixed(0)}
                  </Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 40, color: '#3B82F6' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#F0FDF4', border: 'none', boxShadow: 'none' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Bookings
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {bookings.length}
                  </Typography>
                </Box>
                <Hotel sx={{ fontSize: 40, color: '#10B981' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#FFFBEB', border: 'none', boxShadow: 'none' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Growth Rate
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    +12.5%
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: '#F59E0B' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#F5F3FF', border: 'none', boxShadow: 'none' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Avg. Booking
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    ${(totalRevenue / (bookings.length || 1)).toFixed(0)}
                  </Typography>
                </Box>
                <People sx={{ fontSize: 40, color: '#8B5CF6' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Revenue Trend
              </Typography>
              <Button size="small" startIcon={<Download />} onClick={() => handleExport('Revenue')}>
                Export
              </Button>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Revenue ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Booking Trend
              </Typography>
              <Button size="small" startIcon={<Download />} onClick={() => handleExport('Bookings')}>
                Export
              </Button>
            </Box>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="bookings" stroke="#10B981" strokeWidth={2} name="Bookings" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Performance Metrics
          </Typography>
          <Button size="small" startIcon={<Download />} onClick={() => handleExport('Performance')}>
            Export
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell>
                  <Typography fontWeight={600}>Metric</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight={600}>Value</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {performanceData.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Typography variant="body2">{row.metric}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight={600} color="primary.main">
                      {row.value}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};
