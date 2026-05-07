import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';
import {
  Dashboard,
  Hotel,
  CalendarMonth,
  People,
  Assessment,
  ExitToApp,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
  { text: 'Room Management', icon: <Hotel />, path: '/admin/rooms' },
  { text: 'Reservations', icon: <CalendarMonth />, path: '/admin/reservations' },
  { text: 'Customers', icon: <People />, path: '/admin/customers' },
  { text: 'Reports', icon: <Assessment />, path: '/admin/reports' },
];

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useApp();

  const handleLogout = () => {
    setUser(null);
    navigate('/auth/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'white', color: 'primary.main' }} elevation={0}>
        <Toolbar sx={{ borderBottom: '1px solid #E2E8F0' }}>
          <AdminPanelSettings sx={{ mr: 1 }} />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Admin Panel
          </Typography>
          {user && (
            <>
              <Typography variant="body2" sx={{ mr: 2 }}>
                {user.name}
              </Typography>
              <Button onClick={handleLogout} startIcon={<ExitToApp />} variant="outlined" size="small">
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#1E293B',
            color: 'white',
            borderRight: 'none',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                  sx={{
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      '&:hover': { bgcolor: 'primary.dark' },
                    },
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                    mx: 1,
                    borderRadius: 2,
                    mb: 0.5,
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, bgcolor: '#F8FAFC', p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};
