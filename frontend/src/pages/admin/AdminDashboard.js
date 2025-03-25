import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { 
  Box, Typography, Grid, Paper, CircularProgress, Alert,
  Card, CardContent, CardHeader, Divider
} from '@mui/material';
import { Dashboard as DashboardIcon } from '@mui/icons-material';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSlots: 0,
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    bookingsWithPenalty: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all dashboard stats in a single API call
      const response = await axios.get('/api/admin/dashboard');
      const dashboardStats = response.data;
      
      setStats({
        totalUsers: dashboardStats.totalUsers,
        totalSlots: dashboardStats.totalSlots,
        totalBookings: dashboardStats.totalBookings,
        activeBookings: dashboardStats.activeBookings,
        completedBookings: dashboardStats.completedBookings,
        cancelledBookings: dashboardStats.cancelledBookings,
        bookingsWithPenalty: dashboardStats.bookingsWithPenalty
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
        Admin Dashboard
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="System Overview" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body1"><strong>Total Users:</strong> {stats.totalUsers}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1"><strong>Total Parking Slots:</strong> {stats.totalSlots}</Typography>
                  </Grid>
                </Grid>
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
                  <Grid item xs={12}>
                    <Typography variant="body1" color="error">
                      <strong>Bookings with Penalty:</strong> {stats.bookingsWithPenalty}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdminDashboard;