import {
  Container,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import { CheckCircle, Cancel, Pending, Info } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

export const Notifications = () => {
  const { bookings } = useApp();

  const notifications = bookings.map((booking) => ({
    id: booking.id,
    type: booking.status,
    title:
      booking.status === 'approved'
        ? 'Booking Confirmed'
        : booking.status === 'pending'
        ? 'Booking Pending'
        : 'Booking Cancelled',
    message:
      booking.status === 'approved'
        ? `Your booking for ${booking.roomName} has been confirmed.`
        : booking.status === 'pending'
        ? `Your booking for ${booking.roomName} is awaiting confirmation.`
        : `Your booking for ${booking.roomName} has been cancelled.`,
    date: new Date(booking.createdAt),
    isNew: booking.status === 'approved',
  }));

  const getIcon = (type: string) => {
    switch (type) {
      case 'approved':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'cancelled':
        return <Cancel sx={{ color: 'error.main' }} />;
      case 'pending':
        return <Pending sx={{ color: 'warning.main' }} />;
      default:
        return <Info sx={{ color: 'info.main' }} />;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Notifications
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Stay updated with your booking status
      </Typography>

      <Paper>
        {notifications.length === 0 ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List>
            {notifications.map((notification, index) => (
              <Box key={notification.id}>
                <ListItem
                  sx={{
                    bgcolor: notification.isNew ? '#F0F9FF' : 'transparent',
                    '&:hover': { bgcolor: '#F8FAFC' },
                  }}
                >
                  <ListItemIcon>{getIcon(notification.type)}</ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {notification.title}
                        </Typography>
                        {notification.isNew && <Chip label="New" color="primary" size="small" />}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notification.date.toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};
