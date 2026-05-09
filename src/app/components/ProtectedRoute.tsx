import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    // Redirect unauthenticated users to login, optionally passing the intended destination
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};