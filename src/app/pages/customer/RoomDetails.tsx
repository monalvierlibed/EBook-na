import { useParams, useNavigate } from 'react-router';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
} from '@mui/material';
import {
  Star,
  LocationOn,
  CheckCircle,
  Wifi,
  LocalParking,
  Restaurant,
  FitnessCenter,
  Pool,
  RoomService,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

const amenityIcons: { [key: string]: JSX.Element } = {
  'Free WiFi': <Wifi />,
  'Parking': <LocalParking />,
  'Restaurant': <Restaurant />,
  'Gym': <FitnessCenter />,
  'Pool': <Pool />,
  'Room Service': <RoomService />,
};

export const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rooms } = useApp();

  const room = rooms.find((r) => r.id === id);

  if (!room) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5">Room not found</Typography>
        <Button variant="contained" onClick={() => navigate('/search')} sx={{ mt: 2 }}>
          Back to Search
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
            <Box
              component="img"
              src={room.image}
              alt={room.name}
              sx={{ width: '100%', height: 400, objectFit: 'cover' }}
            />
          </Card>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  {room.name}
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {room.hotelName}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ mr: 0.5 }} />
                  {room.location}
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'right' }}>
                <Chip
                  icon={<Star />}
                  label={`${room.rating} Rating`}
                  color="primary"
                  sx={{ mb: 1 }}
                />
                <br />
                {room.available ? (
                  <Chip label="Available" color="success" icon={<CheckCircle />} />
                ) : (
                  <Chip label="Occupied" color="error" />
                )}
              </Box>
            </Box>

            <Typography variant="body1" color="text.secondary" paragraph>
              {room.description}
            </Typography>

            <Chip label={room.type} variant="outlined" />
          </Box>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Amenities
            </Typography>
            <List>
              {room.amenities.map((amenity, index) => (
                <ListItem key={index}>
                  <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                    {amenityIcons[amenity] || <CheckCircle />}
                  </ListItemIcon>
                  <ListItemText primary={amenity} />
                </ListItem>
              ))}
            </List>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              About This Property
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              This beautiful {room.type.toLowerCase()} room offers an exceptional stay experience with modern amenities
              and comfortable furnishings. Perfect for both business and leisure travelers.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check-in: 3:00 PM | Check-out: 11:00 AM
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 80 }}>
            <Typography variant="h4" color="primary.main" fontWeight={700} gutterBottom>
              ${room.price}
              <Typography component="span" variant="body1" color="text.secondary">
                /night
              </Typography>
            </Typography>

            <Box sx={{ bgcolor: '#F1F5F9', p: 2, borderRadius: 2, mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Price Breakdown (1 night)
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Room Rate</Typography>
                <Typography variant="body2" fontWeight={600}>
                  ${room.price}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Service Fee</Typography>
                <Typography variant="body2" fontWeight={600}>
                  ${(room.price * 0.1).toFixed(0)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Taxes</Typography>
                <Typography variant="body2" fontWeight={600}>
                  ${(room.price * 0.08).toFixed(0)}
                </Typography>
              </Box>
              <Box sx={{ borderTop: '1px solid #CBD5E1', pt: 1, mt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" fontWeight={700}>
                    Total
                  </Typography>
                  <Typography variant="body1" fontWeight={700} color="primary.main">
                    ${(room.price * 1.18).toFixed(0)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {room.available ? (
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => navigate(`/booking/${room.id}`)}
                sx={{ mb: 2 }}
              >
                Book Now
              </Button>
            ) : (
              <Button fullWidth variant="outlined" size="large" disabled sx={{ mb: 2 }}>
                Currently Occupied
              </Button>
            )}

            <Typography variant="caption" color="text.secondary" align="center" display="block">
              Free cancellation within 24 hours
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
