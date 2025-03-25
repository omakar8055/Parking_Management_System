import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Box, Typography, Grid, Paper, CircularProgress, Alert,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip
} from '@mui/material';
import { BookOnline as BookingIcon } from '@mui/icons-material';

const Bookings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`/api/bookings/user/${user.id}`);
      setBookings(response.data);
    } catch (err) {
      setError('Failed to load bookings. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (booking) => {
    setSelectedBooking(booking);
    setOpenDialog(true);
    setActionSuccess('');
    setActionError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBooking(null);
    if (actionSuccess) {
      fetchBookings();
    }
  };

  const handleCompleteBooking = async () => {
    try {
      setActionLoading(true);
      setActionError('');
      
      const response = await axios.put(`/api/bookings/complete/${selectedBooking.id}`);
      
      setActionSuccess('Booking completed successfully!');
      setTimeout(() => {
        handleCloseDialog();
      }, 2000);
    } catch (err) {
      console.error('Complete booking error:', err);
      // Extract the error message from the response or use a default message
      const errorMessage = err.response?.data || 'Failed to complete booking. Please try again.';
      setActionError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    try {
      setActionLoading(true);
      setActionError('');
      
      const response = await axios.put(`/api/bookings/cancel/${selectedBooking.id}`);
      
      setActionSuccess('Booking cancelled successfully!');
      setTimeout(() => {
        handleCloseDialog();
      }, 2000);
    } catch (err) {
      console.error('Cancel booking error:', err);
      // Extract the error message from the response or use a default message
      const errorMessage = err.response?.data || 'Failed to cancel booking. Please try again.';
      setActionError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <Chip label="Active" color="primary" size="small" />;
      case 'COMPLETED':
        return <Chip label="Completed" color="success" size="small" />;
      case 'CANCELLED':
        return <Chip label="Cancelled" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Bookings
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : bookings.length === 0 ? (
        <Alert severity="info">You have no bookings yet.</Alert>
      ) : (
        <Grid container spacing={3}>
          {bookings.map((booking) => (
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
                <Box sx={{ mb: 2 }}>
                  {getStatusChip(booking.status)}
                </Box>
                <Typography variant="body2"><strong>Slot ID:</strong> {booking.slotId}</Typography>
                <Typography variant="body2"><strong>Start Time:</strong> {booking.startTime}</Typography>
                <Typography variant="body2"><strong>End Time:</strong> {booking.endTime}</Typography>
                <Typography variant="body2"><strong>Booking Amount:</strong> ${booking.bookingAmount.toFixed(2)}</Typography>
                <Typography variant="body2"><strong>Total Amount:</strong> ${booking.totalAmount.toFixed(2)}</Typography>
                {booking.penalty && (
                  <Typography variant="body2" color="error">
                    <strong>Penalty:</strong> ${booking.penaltyAmount.toFixed(2)}
                  </Typography>
                )}
                
                {booking.status === 'ACTIVE' && (
                  <Box sx={{ mt: 'auto', pt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => handleOpenDialog(booking)}
                    >
                      Manage Booking
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Booking Action Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Manage Booking #{selectedBooking?.id.substring(0, 8)}</DialogTitle>
        <DialogContent>
          {actionSuccess ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              {actionSuccess}
            </Alert>
          ) : (
            <Box sx={{ mt: 2 }}>
              {actionError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {actionError}
                </Alert>
              )}
              
              <Typography variant="body1" gutterBottom>
                What would you like to do with this booking?
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            {actionSuccess ? 'Close' : 'Cancel'}
          </Button>
          {!actionSuccess && (
            <>
              <Button 
                onClick={handleCancelBooking} 
                color="error" 
                variant="contained"
                disabled={actionLoading}
              >
                Cancel Booking
              </Button>
              <Button 
                onClick={handleCompleteBooking} 
                color="success" 
                variant="contained"
                disabled={actionLoading}
              >
                Complete Booking
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Bookings;