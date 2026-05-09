import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Box,
  CircularProgress,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Payment,
  Notifications as NotificationsIcon,
  Info,
  DoneAll,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

// Define the notification type based on typical Supabase schema
export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'booking_confirmed' | 'reservation_approved' | 'reservation_cancelled' | 'payment_reminder' | 'system_alert';
  read: boolean;
  created_at: string;
  link?: string;
}

export const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial notifications
  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotifications(data as AppNotification[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();

    if (!user) return;

    // Set up Real-Time Subscription with Supabase
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as AppNotification;
          
          // Add to local state dynamically
          setNotifications((prev) => [newNotification, ...prev]);

          // Trigger Sonner Toast based on notification type
          switch (newNotification.type) {
            case 'booking_confirmed':
            case 'reservation_approved':
              toast.success(newNotification.title, { description: newNotification.message });
              break;
            case 'reservation_cancelled':
              toast.error(newNotification.title, { description: newNotification.message });
              break;
            case 'payment_reminder':
              toast.warning(newNotification.title, { description: newNotification.message });
              break;
            default:
              toast.info(newNotification.title, { description: newNotification.message });
          }
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
  };

  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    
    if (user) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmed':
      case 'reservation_approved':
        return <CheckCircle color="success" />;
      case 'reservation_cancelled':
        return <Cancel color="error" />;
      case 'payment_reminder':
        return <Payment color="warning" />;
      default:
        return <Info color="primary" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          Notifications
          {unreadCount > 0 && (
            <Chip 
              label={`${unreadCount} New`} 
              color="primary" 
              size="small" 
              sx={{ ml: 2, verticalAlign: 'middle' }} 
            />
          )}
        </Typography>
        
        {unreadCount > 0 && (
          <Button 
            startIcon={<DoneAll />} 
            onClick={markAllAsRead}
            variant="text"
            color="primary"
          >
            Mark all as read
          </Button>
        )}
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        {notifications.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No notifications yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We'll let you know when there are updates to your bookings or account.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((notification, index) => (
              <Box key={notification.id}>
                <ListItem 
                  alignItems="flex-start" 
                  sx={{ 
                    py: 2.5, 
                    px: 3,
                    bgcolor: notification.read ? 'transparent' : 'rgba(0, 102, 179, 0.04)',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.02)'
                    }
                  }}
                  secondaryAction={
                    !notification.read && (
                      <Button size="small" onClick={() => markAsRead(notification.id)}>
                        Mark Read
                      </Button>
                    )
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'transparent' }}>
                      {getIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight={notification.read ? 500 : 700}>
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1, display: 'block' }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {formatDate(notification.created_at)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider component="li" />}
              </Box>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};