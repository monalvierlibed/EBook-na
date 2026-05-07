import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Box, CircularProgress, Typography } from '@mui/material';
import { supabase } from '../../../lib/supabase';

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { searchParams } = new URL(window.location.href);
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        console.error('Auth error:', error, errorDescription);
        navigate('/auth/login?error=' + encodeURIComponent(errorDescription || error));
        return;
      }

      if (code) {
        try {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Session exchange error:', exchangeError);
            navigate('/auth/login?error=' + encodeURIComponent(exchangeError.message));
            return;
          }

          // Successfully authenticated
          navigate('/');
        } catch (err) {
          console.error('Callback error:', err);
          navigate('/auth/login?error=Authentication failed');
        }
      } else {
        // No code present, redirect to login
        navigate('/auth/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress size={48} />
      <Typography variant="h6" color="text.secondary">
        Completing sign in...
      </Typography>
    </Box>
  );
};
