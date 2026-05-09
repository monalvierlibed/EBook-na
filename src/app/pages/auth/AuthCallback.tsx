import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Box, CircularProgress, Typography } from '@mui/material';
import { supabase } from '../../../lib/supabase';

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const url = new URL(window.location.href);
      const searchParams = url.searchParams;
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      const hash = window.location.hash;

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

          navigate('/');
          return;
        } catch (err) {
          console.error('Callback error:', err);
          navigate('/auth/login?error=Authentication failed');
          return;
        }
      }

      if (hash && hash.length > 0) {
        try {
          const { data, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            console.error('Session retrieval error:', sessionError);
            navigate('/auth/login?error=' + encodeURIComponent(sessionError.message));
            return;
          }

          if (data?.session) {
            navigate('/');
            return;
          }

          // If session is not immediately available, wait briefly and retry.
          await new Promise((resolve) => setTimeout(resolve, 250));
          const { data: retryData, error: retryError } = await supabase.auth.getSession();

          if (retryError) {
            console.error('Session retry error:', retryError);
            navigate('/auth/login?error=' + encodeURIComponent(retryError.message));
            return;
          }

          if (retryData?.session) {
            navigate('/');
            return;
          }

          navigate('/auth/login?error=Authentication failed');
          return;
        } catch (err) {
          console.error('Callback hash error:', err);
          navigate('/auth/login?error=Authentication failed');
          return;
        }
      }

      navigate('/auth/login');
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
