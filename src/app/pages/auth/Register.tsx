import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { TextField, Button, Typography, Box, Divider } from '@mui/material';
import { Hotel, PersonAdd } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';

export const Register = () => {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.name && formData.email && formData.password) {
      setUser({
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: 'customer',
      });
      toast.success('Account created successfully!');
      navigate('/');
    }
  };

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Hotel sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Create Account
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Join HotelBooking today
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          margin="normal"
          required
        />

        <Button
          fullWidth
          type="submit"
          variant="contained"
          size="large"
          startIcon={<PersonAdd />}
          sx={{ mt: 3, mb: 2, py: 1.5 }}
        >
          Create Account
        </Button>
      </form>

      <Divider sx={{ my: 3 }}>
        <Typography variant="caption" color="text.secondary">
          OR
        </Typography>
      </Divider>

      <Typography variant="body2" align="center">
        Already have an account?{' '}
        <Link to="/auth/login" style={{ textDecoration: 'none', color: '#3B82F6', fontWeight: 600 }}>
          Sign In
        </Link>
      </Typography>
    </Box>
  );
};
