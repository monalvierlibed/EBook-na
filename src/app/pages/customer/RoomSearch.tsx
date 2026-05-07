import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Container,
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Paper,
} from '@mui/material';
import { Star, LocationOn, CheckCircle } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

export const RoomSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { rooms } = useApp();

  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    type: 'all',
    priceRange: [0, 600],
    minRating: 0,
    availability: 'all',
  });

  const [filteredRooms, setFilteredRooms] = useState(rooms);

  useEffect(() => {
    let result = rooms;

    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (room) =>
          room.name.toLowerCase().includes(query) ||
          room.hotelName.toLowerCase().includes(query) ||
          room.location.toLowerCase().includes(query)
      );
    }

    if (filters.type !== 'all') {
      result = result.filter((room) => room.type.toLowerCase() === filters.type.toLowerCase());
    }

    result = result.filter(
      (room) => room.price >= filters.priceRange[0] && room.price <= filters.priceRange[1]
    );

    if (filters.minRating > 0) {
      result = result.filter((room) => room.rating >= filters.minRating);
    }

    if (filters.availability === 'available') {
      result = result.filter((room) => room.available);
    }

    setFilteredRooms(result);
  }, [filters, rooms]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Search Rooms
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Find the perfect room for your stay
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, position: 'sticky', top: 80 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Filters
            </Typography>

            <TextField
              fullWidth
              label="Search"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              margin="normal"
              size="small"
            />

            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Room Type</InputLabel>
              <Select
                value={filters.type}
                label="Room Type"
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="standard">Standard</MenuItem>
                <MenuItem value="deluxe">Deluxe</MenuItem>
                <MenuItem value="suite">Suite</MenuItem>
                <MenuItem value="villa">Villa</MenuItem>
                <MenuItem value="executive">Executive</MenuItem>
                <MenuItem value="family">Family</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" gutterBottom>
                Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
              </Typography>
              <Slider
                value={filters.priceRange}
                onChange={(_, value) => setFilters({ ...filters, priceRange: value as number[] })}
                valueLabelDisplay="auto"
                min={0}
                max={600}
                step={50}
              />
            </Box>

            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Min Rating</InputLabel>
              <Select
                value={filters.minRating}
                label="Min Rating"
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value as number })}
              >
                <MenuItem value={0}>All Ratings</MenuItem>
                <MenuItem value={4.0}>4.0+</MenuItem>
                <MenuItem value={4.5}>4.5+</MenuItem>
                <MenuItem value={4.8}>4.8+</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Availability</InputLabel>
              <Select
                value={filters.availability}
                label="Availability"
                onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
              >
                <MenuItem value="all">All Rooms</MenuItem>
                <MenuItem value="available">Available Only</MenuItem>
              </Select>
            </FormControl>

            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() =>
                setFilters({
                  search: '',
                  type: 'all',
                  priceRange: [0, 600],
                  minRating: 0,
                  availability: 'all',
                })
              }
            >
              Reset Filters
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1">
              <strong>{filteredRooms.length}</strong> rooms found
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {filteredRooms.map((room) => (
              <Grid item xs={12} sm={6} lg={4} key={room.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3 }}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={room.image}
                      alt={room.name}
                    />
                    {room.available ? (
                      <Chip
                        label="Available"
                        color="success"
                        size="small"
                        icon={<CheckCircle />}
                        sx={{ position: 'absolute', top: 12, right: 12 }}
                      />
                    ) : (
                      <Chip
                        label="Occupied"
                        color="error"
                        size="small"
                        sx={{ position: 'absolute', top: 12, right: 12 }}
                      />
                    )}
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                        {room.name}
                      </Typography>
                      <Chip
                        icon={<Star sx={{ fontSize: 16 }} />}
                        label={room.rating}
                        size="small"
                        color="primary"
                      />
                    </Box>

                    <Typography variant="body2" fontWeight={500} gutterBottom>
                      {room.hotelName}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                      {room.location}
                    </Typography>

                    <Chip label={room.type} size="small" variant="outlined" sx={{ mb: 2 }} />

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

          {filteredRooms.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No rooms found matching your criteria
              </Typography>
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() =>
                  setFilters({
                    search: '',
                    type: 'all',
                    priceRange: [0, 600],
                    minRating: 0,
                    availability: 'all',
                  })
                }
              >
                Clear Filters
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};
