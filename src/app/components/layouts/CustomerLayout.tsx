import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { AppBar, Toolbar, Typography, Button, IconButton, Badge, Container, Box, Avatar, Menu, MenuItem, Divider } from '@mui/material';
import { Search, History, Notifications, ExitToApp, Person, Flight } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useState } from 'react';

export const CustomerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { bookings } = useApp();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = async () => {
    await signOut();
    setAnchorEl(null);
    navigate('/auth/login');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const notificationCount = bookings.filter(b => b.status === 'confirmed').length;
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
            <Flight sx={{ color: 'primary.main', mr: 0.5, transform: 'rotate(-45deg)' }} />
          </Box>
          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'primary.main', 
              fontWeight: 800,
              letterSpacing: '-0.5px',
            }}
          >
            EBook Na
            <Typography component="span" sx={{ color: 'secondary.main', fontWeight: 800, ml: 0.5 }}>
              PH
            </Typography>
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
            Explore
          </Button>

          {user && (
            <Button
              component={Link}
              to="/bookings"
              startIcon={<History />}
              sx={{ mx: 1, color: location.pathname === '/bookings' ? 'primary.main' : 'text.secondary' }}
            >
              My Bookings
            </Button>
          )}

          {user && (
            <IconButton component={Link} to="/notifications" sx={{ mx: 1 }}>
              <Badge badgeContent={notificationCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          )}

          {user ? (
            <>
              <IconButton onClick={handleMenuOpen} sx={{ ml: 1 }}>
                <Avatar 
                  src={profile?.avatar_url || user?.user_metadata?.avatar_url} 
                  sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {displayName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem component={Link} to="/bookings" onClick={handleMenuClose}>
                  <History sx={{ mr: 1, fontSize: 20 }} /> My Bookings
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ExitToApp sx={{ mr: 1, fontSize: 20 }} /> Sign Out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button component={Link} to="/auth/login" variant="contained" size="small">
              Sign In
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
        <Outlet />
      </Box>

      <Box component="footer" sx={{ bgcolor: '#0F172A', color: 'white', py: 6, mt: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 4 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Flight sx={{ color: '#FCD116', mr: 0.5, transform: 'rotate(-45deg)' }} />
                <Typography variant="h6" fontWeight={800}>
                  EBook Na
                  <Typography component="span" sx={{ color: '#FCD116', fontWeight: 800, ml: 0.5 }}>
                    PH
                  </Typography>
                </Typography>
              </Box>
              <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ maxWidth: 300 }}>
                Discover the beauty of the Philippines. Book hotels, resorts, and accommodations across the archipelago.
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Popular Destinations
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mb: 1 }}>Boracay</Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mb: 1 }}>Palawan</Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mb: 1 }}>Cebu</Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mb: 1 }}>Siargao</Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Support
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mb: 1 }}>Help Center</Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mb: 1 }}>Contact Us</Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mb: 1 }}>Terms of Service</Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mb: 1 }}>Privacy Policy</Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />
          
          <Typography variant="body2" align="center" color="rgba(255,255,255,0.5)">
            © 2026 EBook Na PH. All rights reserved. Made with love in the Philippines.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};
