import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  InputAdornment,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Search, Star, LocationOn, TrendingUp, LocalOffer, BeachAccess, Explore, ArrowForward } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

export const Home = () => {
  const navigate = useNavigate();
  const { destinations, featuredHotels, loading } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/search');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getLowestPrice = (hotel: typeof featuredHotels[0]) => {
    if (!hotel.rooms || hotel.rooms.length === 0) return null;
    return Math.min(...hotel.rooms.map(r => r.price_per_night));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(180deg, #EEE9FF 0%, #F7F5FF 100%)',
          color: '#1E2133',
          py: { xs: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.45,
            background: 'radial-gradient(circle at center, #D9D2FF 0%, rgba(217, 210, 255, 0) 60%)',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Chip
              label="Book hotels and rooms with ease"
              sx={{ 
                bgcolor: '#FFFFFF',
                border: '1px solid #E6E1FA',
                color: '#4B4D64',
                fontWeight: 600,
                mb: 2,
              }} 
            />
            <Typography variant="h2" fontWeight={800} sx={{ mb: 1, fontSize: { xs: '2rem', md: '3rem' }, color: '#1E2133' }}>
              Find Your Perfect Stay
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: '#5E617A', fontWeight: 400 }}>
              Book hotels and rooms with 24/7 support and best-price guarantees.
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            maxWidth: 760, 
            mx: 'auto',
            flexDirection: { xs: 'column', sm: 'row' },
            bgcolor: 'white',
            border: '1px solid #E7E5F4',
            borderRadius: 3,
            boxShadow: '0 8px 24px rgba(17, 24, 39, 0.08)',
            p: 2,
          }}>
            <TextField
              fullWidth
              placeholder="Where do you want to go? (Boracay, Palawan, Cebu...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                bgcolor: '#F9FAFB',
                borderRadius: 2,
              }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={handleSearch}
              sx={{
                bgcolor: '#3478F6',
                color: '#FFFFFF',
                px: 4,
                fontWeight: 700,
                '&:hover': { bgcolor: '#2B63CC' },
                minWidth: { xs: '100%', sm: 'auto' },
              }}
            >
              Search Hotels
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Quick Stats */}
      <Container maxWidth="lg" sx={{ mt: -4, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {[
            { icon: <TrendingUp />, label: 'Top Destinations', count: '8 Regions' },
            { icon: <LocalOffer />, label: 'Best Deals', count: 'Save up to 40%' },
            { icon: <Star />, label: 'Verified Reviews', count: '4.8+ Rating' },
          ].map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ textAlign: 'center', p: 3, height: '100%', bgcolor: 'white' }}>
                <Box sx={{ color: 'primary.main', mb: 1 }}>{item.icon}</Box>
                <Typography variant="h6" fontWeight={600}>
                  {item.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.count}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Destinations */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Explore sx={{ color: 'primary.main', mr: 1 }} />
            <Typography variant="h4" fontWeight={700}>
              Explore Destinations
            </Typography>
          </Box>
          <Button 
            endIcon={<ArrowForward />} 
            onClick={() => navigate('/search')}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            View All
          </Button>
        </Box>

        <Grid container spacing={2} sx={{ mb: 7 }}>
          {destinations.slice(0, 4).map((destination) => (
            <Grid item xs={6} md={3} key={destination.id}>
              <Card 
                sx={{ 
                  position: 'relative', 
                  borderRadius: 3, 
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.015)' },
                }}
                onClick={() => navigate(`/search?destination=${destination.id}`)}
              >
                <CardMedia
                  component="img"
                  height="160"
                  image={destination.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'}
                  alt={destination.name}
                  sx={{ filter: 'brightness(0.8)' }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 1.5,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    color: 'white',
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    {destination.name}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    {destination.region}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Featured Hotels */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Star sx={{ color: '#FCD116', mr: 1 }} />
            <Typography variant="h4" fontWeight={700}>
              Featured Hotels
            </Typography>
          </Box>
          <Button 
            endIcon={<ArrowForward />} 
            onClick={() => navigate('/search')}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            View All
          </Button>
        </Box>

        <Grid container spacing={2.5} sx={{ mb: 7 }}>
          {featuredHotels.slice(0, 6).map((hotel) => {
            const lowestPrice = getLowestPrice(hotel);
            return (
              <Grid item xs={12} sm={6} md={4} key={hotel.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    borderRadius: 3, 
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.12)' },
                  }}
                  onClick={() => navigate(`/hotel/${hotel.id}`)}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="168"
                      image={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
                      alt={hotel.name}
                    />
                    {hotel.featured && (
                      <Chip
                        label="Featured"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          bgcolor: '#FCD116',
                          color: '#0F172A',
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: 1.75 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                        {hotel.name}
                      </Typography>
                      <Chip
                        icon={<Star sx={{ fontSize: 14, color: '#FCD116 !important' }} />}
                        label={hotel.rating.toFixed(1)}
                        size="small"
                        sx={{ bgcolor: '#0066B3', color: 'white' }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                      {hotel.city}, {hotel.province}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {hotel.amenities?.slice(0, 3).map((amenity, idx) => (
                        <Chip key={idx} label={amenity} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                      ))}
                    </Box>
                    {lowestPrice && (
                      <Typography variant="h6" color="primary.main" fontWeight={700}>
                        {formatPrice(lowestPrice)}
                        <Typography component="span" variant="body2" color="text.secondary" fontWeight={400}>
                          /night
                        </Typography>
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ p: 1.75, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/hotel/${hotel.id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Beach Banner */}
        <Card
          sx={{
            background: 'linear-gradient(135deg, #0066B3 0%, #004080 100%)',
            color: 'white',
            p: { xs: 3, md: 6 },
            borderRadius: 4,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 3,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
              Ready for Your Philippine Adventure?
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Explore thousands of hotels across 7,641 beautiful islands. Book now and create unforgettable memories.
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<BeachAccess />}
            onClick={() => navigate('/search')}
            sx={{
              bgcolor: '#FCD116',
              color: '#0F172A',
              px: 4,
              py: 1.5,
              fontWeight: 700,
              '&:hover': { bgcolor: '#E6BC00' },
              flexShrink: 0,
            }}
          >
            Start Exploring
          </Button>
        </Card>
      </Container>
    </Box>
  );
};
