import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { AppBar, Toolbar, Typography, Button, IconButton, Badge, Container, Box } from '@mui/material';
import { Hotel, Search, History, Notifications, ExitToApp } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

export const CustomerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser, bookings } = useApp();

  const handleLogout = () => {
    setUser(null);
    navigate('/auth/login');
  };

  const notificationCount = bookings.filter(b => b.status === 'approved').length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <Toolbar>
          <Hotel sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'primary.main', fontWeight: 700 }}>
            HotelBooking
          </Typography>

          <Button
            component={Link}
            to="/"
            sx={{ mx: 1, color: location.pathname === '/' ? 'primary.main' : 'text.secondary' }}
          >
            Home
          </Button>

          <Button
            component={Link}
            to="/search"
            startIcon={<Search />}
            sx={{ mx: 1, color: location.pathname === '/search' ? 'primary.main' : 'text.secondary' }}
          >
            Search
          </Button>

          <Button
            component={Link}
            to="/bookings"
            startIcon={<History />}
            sx={{ mx: 1, color: location.pathname === '/bookings' ? 'primary.main' : 'text.secondary' }}
          >
            My Bookings
          </Button>

          <IconButton component={Link} to="/notifications" sx={{ mx: 1 }}>
            <Badge badgeContent={notificationCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {user ? (
            <>
              <Typography variant="body2" sx={{ mx: 2, color: 'text.secondary' }}>
                {user.name}
              </Typography>
              <Button onClick={handleLogout} startIcon={<ExitToApp />} variant="outlined" size="small">
                Logout
              </Button>
            </>
          ) : (
            <Button component={Link} to="/auth/login" variant="contained" size="small">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
        <Outlet />
      </Box>

      <Box component="footer" sx={{ bgcolor: '#1E293B', color: 'white', py: 4, mt: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" align="center">
            © 2026 HotelBooking. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};
