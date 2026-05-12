import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

export const ProtectedAdminRoute = () => {
  const { user, profile, loading } = useAuth();

  // ONLY check the official loading state. No more infinite traps!
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />; 
  }

  return <Outlet />;
};
