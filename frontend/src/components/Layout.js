import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppBar, Box, Toolbar, Typography, Button, Container, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Dashboard as DashboardIcon, LocalParking as ParkingIcon, BookOnline as BookingIcon, Person as PersonIcon, ExitToApp as LogoutIcon, AdminPanelSettings as AdminIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Parking Slots', icon: <ParkingIcon />, path: '/parking-slots' },
    { text: 'My Bookings', icon: <BookingIcon />, path: '/bookings' },
  ];
  
  const adminMenuItems = [
    { text: 'Admin Dashboard', icon: <AdminIcon />, path: '/admin' },
    { text: 'Manage Slots', icon: <ParkingIcon />, path: '/admin/parking-slots' },
    { text: 'Manage Bookings', icon: <BookingIcon />, path: '/admin/bookings' },
    { text: 'Manage Users', icon: <PersonIcon />, path: '/admin/users' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Parking Management System
          </Typography>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Welcome, {user?.username}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem button key={item.text} onClick={() => navigate(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
          
          {isAdmin && (
            <>
              <Divider />
              <List>
                {adminMenuItems.map((item) => (
                  <ListItem button key={item.text} onClick={() => navigate(item.path)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Box>
      </Drawer>
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;