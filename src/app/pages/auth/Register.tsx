import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { TextField, Button, Typography, Box, Divider, CircularProgress, Alert } from '@mui/material';
import { Flight, PersonAdd, Google, Facebook } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export const Register = () => {
  const navigate = useNavigate();
  const { signUpWithEmail, signInWithGoogle, signInWithFacebook } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error } = await signUpWithEmail(formData.email, formData.password, formData.name);
    
    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  const handleGoogleSignIn = async () => {
    setSocialLoading('google');
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message);
      setSocialLoading(null);
    }
  };

  const handleFacebookSignIn = async () => {
    setSocialLoading('facebook');
    const { error } = await signInWithFacebook();
    if (error) {
      toast.error(error.message);
      setSocialLoading(null);
    }
  };

  if (success) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Flight sx={{ fontSize: 48, color: 'primary.main', transform: 'rotate(-45deg)' }} />
        </Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Check Your Email
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          We sent a confirmation link to <strong>{formData.email}</strong>. 
          Please check your inbox and click the link to activate your account.
        </Typography>
        <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
          <Typography variant="body2">
            {"Didn't receive the email? Check your spam folder or "}
            <Link to="/auth/login" style={{ color: '#0066B3' }}>try signing in</Link>
            {" if you've already confirmed."}
          </Typography>
        </Alert>
        <Button
          component={Link}
          to="/auth/login"
          variant="contained"
          size="large"
          fullWidth
        >
          Go to Sign In
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <Flight sx={{ fontSize: 48, color: 'primary.main', transform: 'rotate(-45deg)' }} />
        </Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Create Account
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Join EBook Na PH and start exploring the Philippines
        </Typography>
      </Box>

      {/* Social Login Buttons */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        <Button
          fullWidth
          variant="outlined"
          size="large"
          startIcon={socialLoading === 'google' ? <CircularProgress size={20} /> : <Google />}
          onClick={handleGoogleSignIn}
          disabled={socialLoading !== null}
          sx={{
            py: 1.5,
            borderColor: '#E2E8F0',
            color: 'text.primary',
            '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
          }}
        >
          Continue with Google
        </Button>
        <Button
          fullWidth
          variant="outlined"
          size="large"
          startIcon={socialLoading === 'facebook' ? <CircularProgress size={20} /> : <Facebook />}
          onClick={handleFacebookSignIn}
          disabled={socialLoading !== null}
          sx={{
            py: 1.5,
            borderColor: '#E2E8F0',
            color: '#1877F2',
            '&:hover': { borderColor: '#1877F2', bgcolor: 'rgba(24, 119, 242, 0.05)' },
          }}
        >
          Continue with Facebook
        </Button>
      </Box>

      <Divider sx={{ my: 3 }}>
        <Typography variant="caption" color="text.secondary">
          or sign up with email
        </Typography>
      </Divider>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          required
          disabled={loading}
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
          disabled={loading}
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
          disabled={loading}
          helperText="At least 6 characters"
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
          disabled={loading}
        />

        <Button
          fullWidth
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAdd />}
          sx={{ mt: 3, mb: 2, py: 1.5 }}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <Typography variant="body2" align="center">
        Already have an account?{' '}
        <Link to="/auth/login" style={{ textDecoration: 'none', color: '#0066B3', fontWeight: 600 }}>
          Sign In
        </Link>
      </Typography>
    </Box>
  );
};
