import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

export const ProtectedAdminRoute = () => {
  const { user, profile, loading } = useAuth();

  // Wait for the auth state to resolve before redirecting
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Not logged in? Send to login.
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Logged in, but not an admin? Send to the homepage.
  // Note: Adjust 'admin' to match exactly how it's stored in your Supabase profiles table.
  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />; 
  }

  // User is an authorized admin, render the child routes
  return <Outlet />;
};