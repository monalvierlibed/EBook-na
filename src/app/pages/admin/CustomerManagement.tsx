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
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Chip,
} from '@mui/material';
import { Search, Visibility, Block, Delete } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';

export const CustomerManagement = () => {
  const { bookings } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);

  const customers = Array.from(
    new Set(bookings.map((b) => ({ id: b.id.substring(2, 8), email: `customer${b.id.substring(2, 8)}@email.com` })))
  ).map((c, index) => ({
    id: c.id,
    name: `Customer ${index + 1}`,
    email: c.email,
    phone: `+1 (555) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
    totalBookings: bookings.filter((b) => b.id.includes(c.id)).length,
    status: 'Active',
    joinedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  }));

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetails = (customer: any) => {
    setSelectedCustomer(customer);
    setDetailsDialog(true);
  };

  const handleDisableAccount = (customerId: string) => {
    toast.success('Customer account disabled');
  };

  const handleDeleteAccount = (customerId: string) => {
    toast.success('Customer account deleted');
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Customer Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View and manage customer accounts
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextField
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <Typography variant="body2" color="text.secondary">
          Total Customers: <strong>{customers.length}</strong>
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              <TableCell>
                <Typography fontWeight={600}>Customer ID</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={600}>Name</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={600}>Email</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={600}>Phone</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={600}>Total Bookings</Typography>
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
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {customer.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{customer.name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {customer.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{customer.phone}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {customer.totalBookings}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={customer.status} color="success" size="small" />
                </TableCell>
                <TableCell>
                  <IconButton size="small" color="primary" onClick={() => handleViewDetails(customer)}>
                    <Visibility fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="warning" onClick={() => handleDisableAccount(customer.id)}>
                    <Block fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteAccount(customer.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="sm" fullWidth>
        {selectedCustomer && (
          <>
            <DialogTitle>
              <Typography variant="h6" fontWeight={600}>
                Customer Details
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Grid2 container spacing={2} sx={{ mt: 1 }}>
                <Grid2 xs={12}>
                  <Paper sx={{ p: 2, bgcolor: '#F8FAFC' }}>
                    <Typography variant="caption" color="text.secondary">
                      Customer ID
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedCustomer.id}
                    </Typography>
                  </Paper>
                </Grid2>

                <Grid2 xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Name
                  </Typography>
                  <Typography variant="body1">{selectedCustomer.name}</Typography>
                </Grid2>

                <Grid2 xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Email
                  </Typography>
                  <Typography variant="body1">{selectedCustomer.email}</Typography>
                </Grid2>

                <Grid2 xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Phone
                  </Typography>
                  <Typography variant="body1">{selectedCustomer.phone}</Typography>
                </Grid2>

                <Grid2 xs={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Bookings
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="primary.main">
                    {selectedCustomer.totalBookings}
                  </Typography>
                </Grid2>

                <Grid2 xs={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Status
                  </Typography>
                  <Chip label={selectedCustomer.status} color="success" />
                </Grid2>

                <Grid2 xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Member since: {new Date(selectedCustomer.joinedDate).toLocaleDateString()}
                  </Typography>
                </Grid2>
              </Grid2>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 2 }}>
              <Button onClick={() => setDetailsDialog(false)}>Close</Button>
              <Button variant="outlined" color="error" onClick={() => handleDisableAccount(selectedCustomer.id)}>
                Disable Account
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};


