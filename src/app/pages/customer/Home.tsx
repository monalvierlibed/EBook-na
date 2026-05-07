import { useState } from 'react';
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
} from '@mui/material';
import { Search, Star, LocationOn, TrendingUp, LocalOffer } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

export const Home = () => {
  const navigate = useNavigate();
  const { rooms } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const featuredRooms = rooms.filter(room => room.rating >= 4.7).slice(0, 3);
  const nearbyRooms = rooms.slice(0, 4);

  const handleSearch = () => {
    if (searchQuery) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <Box>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 12,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" fontWeight={700} gutterBottom>
            Find Your Perfect Stay
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Discover amazing hotels and rooms at the best prices
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, maxWidth: 700, mx: 'auto' }}>
            <TextField
              fullWidth
              placeholder="Search hotels, rooms, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{
                bgcolor: 'white',
                borderRadius: 2,
                '& fieldset': { border: 'none' },
              }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={handleSearch}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 4,
                '&:hover': { bgcolor: '#f1f5f9' },
              }}
            >
              Search
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -4, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {[
            { icon: <TrendingUp />, label: 'Trending', count: '150+ Hotels' },
            { icon: <LocalOffer />, label: 'Best Deals', count: 'Save up to 40%' },
            { icon: <Star />, label: 'Top Rated', count: '4.8+ Rating' },
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

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Star sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h4" fontWeight={700}>
            Featured Hotels
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 8 }}>
          {featuredRooms.map((room) => (
            <Grid item xs={12} md={4} key={room.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={room.image}
                  alt={room.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {room.name}
                    </Typography>
                    <Chip
                      icon={<Star sx={{ fontSize: 16 }} />}
                      label={room.rating}
                      size="small"
                      color="primary"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                    {room.location}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {room.hotelName}
                  </Typography>
                  <Typography variant="h5" color="primary.main" fontWeight={700}>
                    ${room.price}
                    <Typography component="span" variant="body2" color="text.secondary">
                      /night
                    </Typography>
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate(`/room/${room.id}`)}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LocationOn sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h4" fontWeight={700}>
            Nearby Hotels
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {nearbyRooms.map((room) => (
            <Grid item xs={12} sm={6} md={3} key={room.id}>
              <Card sx={{ height: '100%', borderRadius: 3, overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  height="150"
                  image={room.image}
                  alt={room.name}
                />
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} noWrap>
                    {room.hotelName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {room.name}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="h6" color="primary.main" fontWeight={700}>
                      ${room.price}
                    </Typography>
                    <Chip icon={<Star />} label={room.rating} size="small" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
