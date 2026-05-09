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
  Button,
  Stack,
} from '@mui/material';
import { CheckCircle, Cancel, Pending, Info, MarkEmailRead, DeleteSweep } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

export const Notifications = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmed':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'booking_cancelled':
        return <Cancel sx={{ color: 'error.main' }} />;
      case 'booking_pending':
        return <Pending sx={{ color: 'warning.main' }} />;
      case 'booking_completed':
        return <CheckCircle sx={{ color: 'info.main' }} />;
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

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
        <Button variant="outlined" startIcon={<MarkEmailRead />} onClick={markAllNotificationsRead}>
          Mark all as read
        </Button>
        <Button variant="outlined" color="error" startIcon={<DeleteSweep />} onClick={clearNotifications}>
          Clear all
        </Button>
      </Stack>

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
                  onClick={() => markNotificationRead(notification.id)}
                  sx={{
                    bgcolor: notification.isNew ? '#F0F9FF' : 'transparent',
                    cursor: 'pointer',
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
                        <Chip label={notification.channel === 'email' ? 'Email' : 'In-app'} size="small" variant="outlined" />
                        {notification.isNew && <Chip label="New" color="primary" size="small" />}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(notification.createdAt).toLocaleString()}
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
