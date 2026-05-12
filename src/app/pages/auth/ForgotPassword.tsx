import { useState } from 'react';
import { Link } from 'react-router';
import { TextField, Button, Typography, Box } from '@mui/material';
import { Hotel, Email } from '@mui/icons-material';
import { toast } from 'sonner';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      toast.success('Password reset link sent to your email!');
    }
  };

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Hotel sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Forgot Password
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your email to receive a reset link
        </Typography>
      </Box>

      {submitted ? (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Email sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="body1" gutterBottom>
            Check your email for the password reset link.
          </Typography>
          <Button component={Link} to="/auth/login" variant="contained" sx={{ mt: 3 }}>
            Back to Login
          </Button>
        </Box>
      ) : (
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

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            Send Reset Link
          </Button>

          <Typography variant="body2" align="center">
            <Link to="/auth/login" style={{ textDecoration: 'none', color: '#3B82F6', fontWeight: 600 }}>
              Back to Login
            </Link>
          </Typography>
        </form>
      )}
    </Box>
  );
};

