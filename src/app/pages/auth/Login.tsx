import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { TextField, Button, Typography, Box, Divider, Alert, CircularProgress } from '@mui/material';
import { Flight, Login as LoginIcon, Google, Facebook } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';

export const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signInWithEmail, signInWithGoogle, signInWithFacebook } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);

  const errorMessage = searchParams.get('error');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signInWithEmail(email, password);
    
    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success('Maligayang pagbabalik! Welcome back!');
      
      // Wait to get the user's ID
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Look up their role right now
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        // Send them to the correct dashboard based on their role
        if (profile?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        navigate('/');
      }
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

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <Flight sx={{ fontSize: 48, color: 'primary.main', transform: 'rotate(-45deg)' }} />
        </Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Maligayang Pagbabalik!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in to continue to EBook Na PH
        </Typography>
      </Box>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

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
          or sign in with email
        </Typography>
      </Divider>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
          disabled={loading}
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
          disabled={loading}
        />

        <Box sx={{ textAlign: 'right', mt: 1, mb: 2 }}>
          <Link to="/auth/forgot-password" style={{ textDecoration: 'none', fontSize: '0.875rem', color: '#0066B3' }}>
            Forgot Password?
          </Link>
        </Box>

        <Button
          fullWidth
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
          sx={{ mt: 2, mb: 2, py: 1.5 }}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <Typography variant="body2" align="center">
        {"Don't have an account? "}
        <Link to="/auth/register" style={{ textDecoration: 'none', color: '#0066B3', fontWeight: 600 }}>
          Sign Up
        </Link>
      </Typography>
    </Box>
  );
};
