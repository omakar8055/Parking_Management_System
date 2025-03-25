import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Box, Typography, Grid, Paper, CircularProgress, Alert,
  Card, CardContent, CardHeader, Divider
} from '@mui/material';
import { Dashboard as DashboardIcon, BookOnline as BookingIcon } from '@mui/icons-material';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeBookings, setActiveBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch active bookings
      const bookingsResponse = await axios.get(`/api/bookings/active/user/${user.id}`);
      setActiveBookings(bookingsResponse.data);
      
      // Fetch all user bookings for stats
      const allBookingsResponse = await axios.get(`/api/bookings/user/${user.id}`);
      const allBookings = allBookingsResponse.data;
      
      // Calculate stats
      const completed = allBookings.filter(booking => booking.status === 'COMPLETED').length;
      const cancelled = allBookings.filter(booking => booking.status === 'CANCELLED').length;
      const active = allBookings.filter(booking => booking.status === 'ACTIVE').length;
      
      setStats({
        totalBookings: allBookings.length,
        activeBookings: active,
        completedBookings: completed,
        cancelledBookings: cancelled
      });
    } catch (err) {
      setError('Failed to load dashboard data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="User Information" />
                <Divider />
                <CardContent>
                  <Typography variant="body1"><strong>Username:</strong> {user.username}</Typography>
                  <Typography variant="body1"><strong>Email:</strong> {user.email}</Typography>
                  <Typography variant="body1">
                    <strong>Role:</strong> {user.roles.map(role => role.replace('ROLE_', '')).join(', ')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Booking Statistics" />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body1"><strong>Total Bookings:</strong> {stats.totalBookings}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1"><strong>Active Bookings:</strong> {stats.activeBookings}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1"><strong>Completed:</strong> {stats.completedBookings}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1"><strong>Cancelled:</strong> {stats.cancelledBookings}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Typography variant="h5" gutterBottom>
            Active Bookings
          </Typography>
          
          {activeBookings.length === 0 ? (
            <Alert severity="info">You have no active bookings.</Alert>
          ) : (
            <Grid container spacing={3}>
              {activeBookings.map((booking) => (
                <Grid item xs={12} sm={6} md={4} key={booking.id}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <BookingIcon sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
                      <Typography variant="h6">
                        Booking #{booking.id.substring(0, 8)}
                      </Typography>
                    </Box>
                    <Typography variant="body2"><strong>Slot ID:</strong> {booking.slotId}</Typography>
                    <Typography variant="body2"><strong>Start Time:</strong> {booking.startTime}</Typography>
                    <Typography variant="body2"><strong>End Time:</strong> {booking.endTime}</Typography>
                    <Typography variant="body2"><strong>Status:</strong> {booking.status}</Typography>
                    {booking.penalty && (
                      <Typography variant="body2" color="error">
                        <strong>Penalty:</strong> ${booking.penaltyAmount.toFixed(2)}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};

export default Dashboard;