import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { AppBar, Toolbar, Typography, Button, IconButton, Badge, Container, Box, Avatar, Menu, MenuItem, Divider } from '@mui/material';
import { Search, History, Notifications, ExitToApp, Flight, Mail, Phone, Facebook, Twitter, Instagram } from '@mui/icons-material';
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
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #E5E7EB' }}>
        <Toolbar sx={{ minHeight: 64 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
            <Flight sx={{ color: '#111827', mr: 0.5, transform: 'rotate(-45deg)', fontSize: 18 }} />
          </Box>
          <Typography 
            variant="subtitle1" 
            component={Link} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: '#111827', 
              fontWeight: 700,
            }}
          >
            E-Book Mo
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
            Hotels
          </Button>

          <Button
            component={Link}
            to="/search"
            sx={{ mx: 1, color: 'text.secondary' }}
          >
            Rooms
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
                  sx={{ width: 32, height: 32, bgcolor: 'white', border: '1px solid #D1D5DB', color: '#6B7280' }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Box sx={{ ml: 1, display: { xs: 'none', md: 'block' } }}>
                <Typography variant="caption" color="text.secondary">Your account</Typography>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: -0.3 }}>
                  name
                </Typography>
              </Box>
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

      <Box component="footer" sx={{ bgcolor: '#0F1F3A', color: 'white', py: 5, mt: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 4 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Flight sx={{ color: '#7EA6FF', mr: 0.5, transform: 'rotate(-45deg)', fontSize: 18 }} />
                <Typography variant="subtitle1" fontWeight={700}>E-Book Mo</Typography>
              </Box>
              <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ maxWidth: 300 }}>
                Your trusted partner for hassle-free hotel bookings.
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Quick Links
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mb: 1 }}>About Us</Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mb: 1 }}>Hotels</Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mb: 1 }}>Rooms</Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mb: 1 }}>Contact</Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Support
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mb: 1 }}>Help Center</Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mb: 1 }}>Terms of Service</Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mb: 1 }}>Privacy Policy</Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mb: 1 }}>FAQs</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Contact Us
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Mail sx={{ fontSize: 14 }} /> support@ebookmo.com
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ fontSize: 14 }} /> +1 (555) 123-4567
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.8)' }}><Facebook sx={{ fontSize: 16 }} /></IconButton>
                <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.8)' }}><Twitter sx={{ fontSize: 16 }} /></IconButton>
                <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.8)' }}><Instagram sx={{ fontSize: 16 }} /></IconButton>
              </Box>
            </Box>
          </Box>
          
          <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />
          
          <Typography variant="body2" align="center" color="rgba(255,255,255,0.5)">© 2026 E-Book Mo. All rights reserved.</Typography>
        </Container>
      </Box>
    </Box>
  );
};
