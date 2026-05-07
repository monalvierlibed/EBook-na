import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { TextField, Button, Typography, Box, Divider, Alert } from '@mui/material';
import { Hotel, Login as LoginIcon } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';

export const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (email === 'admin@hotel.com' && password === 'admin123') {
      setUser({
        id: '1',
        name: 'Admin User',
        email: 'admin@hotel.com',
        role: 'admin',
      });
      toast.success('Welcome back, Admin!');
      navigate('/admin');
    } else if (email && password) {
      setUser({
        id: '2',
        name: 'John Doe',
        email: email,
        role: 'customer',
      });
      toast.success('Login successful!');
      navigate('/');
    } else {
      toast.error('Please enter valid credentials');
    }
  };

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Hotel sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome Back
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in to continue to HotelBooking
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="caption">
          <strong>Demo Credentials:</strong><br />
          Customer: any email + password<br />
          Admin: admin@hotel.com / admin123
        </Typography>
      </Alert>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
        />

        <Box sx={{ textAlign: 'right', mt: 1, mb: 2 }}>
          <Link to="/auth/forgot-password" style={{ textDecoration: 'none', fontSize: '0.875rem', color: '#3B82F6' }}>
            Forgot Password?
          </Link>
        </Box>

        <Button
          fullWidth
          type="submit"
          variant="contained"
          size="large"
          startIcon={<LoginIcon />}
          sx={{ mt: 2, mb: 2, py: 1.5 }}
        >
          Sign In
        </Button>
      </form>

      <Divider sx={{ my: 3 }}>
        <Typography variant="caption" color="text.secondary">
          OR
        </Typography>
      </Divider>

      <Typography variant="body2" align="center">
        Don't have an account?{' '}
        <Link to="/auth/register" style={{ textDecoration: 'none', color: '#3B82F6', fontWeight: 600 }}>
          Sign Up
        </Link>
      </Typography>
    </Box>
  );
};
