import { Outlet, Link } from 'react-router';
import { Box, Container, Paper, Typography } from '@mui/material';
import { Flight } from '@mui/icons-material';

export const AuthLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0066B3 0%, #004080 50%, #002855 100%)',
        py: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      />
      
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <Box 
          component={Link} 
          to="/"
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mb: 3,
            textDecoration: 'none',
          }}
        >
          <Flight sx={{ fontSize: 32, color: 'white', mr: 0.5, transform: 'rotate(-45deg)' }} />
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 800 }}>
            EBook Na
            <Typography component="span" sx={{ color: '#FCD116', fontWeight: 800, ml: 0.5 }}>
              PH
            </Typography>
          </Typography>
        </Box>
        
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
          }}
        >
          <Outlet />
        </Paper>
        
        <Typography 
          variant="body2" 
          align="center" 
          sx={{ mt: 3, color: 'rgba(255,255,255,0.7)' }}
        >
          Your gateway to Philippine destinations
        </Typography>
      </Container>
    </Box>
  );
};
