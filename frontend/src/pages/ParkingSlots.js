import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Box, Typography, Grid, Paper, CircularProgress, Alert, 
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { LocalParking as ParkingIcon } from '@mui/icons-material';

const ParkingSlots = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [parkingSlots, setParkingSlots] = useState([]);
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingData, setBookingData] = useState({
    startTime: '',
    endTime: ''
  });
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchParkingSlots();
  }, []);

  const fetchParkingSlots = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('/api/parking-slots/available');
      setParkingSlots(response.data);
    } catch (err) {
      setError('Failed to load parking slots. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingOpen = (slot) => {
    setSelectedSlot(slot);
    setOpenBookingDialog(true);
    setBookingError('');
    setBookingSuccess(false);
  };

  const handleBookingClose = () => {
    setOpenBookingDialog(false);
    setSelectedSlot(null);
    setBookingData({
      startTime: '',
      endTime: ''
    });
    if (bookingSuccess) {
      fetchParkingSlots();
    }
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookingSubmit = async () => {
    try {
      setBookingError('');
      
      // Validate form
      if (!bookingData.startTime || !bookingData.endTime) {
        return setBookingError('Please fill in all fields');
      }
      
      // Create booking
      const booking = {
        userId: user.id,
        slotId: selectedSlot.id,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        status: 'ACTIVE'
      };
      
      const response = await axios.post('/api/bookings', booking);
      
      setBookingSuccess(true);
      setTimeout(() => {
        handleBookingClose();
      }, 2000);
    } catch (err) {
      setBookingError(err.response?.data || 'Failed to create booking. Please try again.');
      console.error(err);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Available Parking Slots
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : parkingSlots.length === 0 ? (
        <Alert severity="info">No parking slots available at the moment.</Alert>
      ) : (
        <Grid container spacing={3}>
          {parkingSlots.map((slot) => (
            <Grid item xs={12} sm={6} md={4} key={slot.id}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%'
                }}
              >
                <ParkingIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Slot {slot.slotNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status: {slot.status}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Hourly Rate: ${slot.hourlyRate.toFixed(2)}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleBookingOpen(slot)}
                  >
                    Book Now
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Booking Dialog */}
      <Dialog open={openBookingDialog} onClose={handleBookingClose}>
        <DialogTitle>Book Parking Slot {selectedSlot?.slotNumber}</DialogTitle>
        <DialogContent>
          {bookingSuccess ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              Booking created successfully!
            </Alert>
          ) : (
            <Box sx={{ mt: 2 }}>
              {bookingError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {bookingError}
                </Alert>
              )}
              
              <TextField
                label="Start Time"
                type="datetime-local"
                name="startTime"
                value={bookingData.startTime}
                onChange={handleBookingChange}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                label="End Time"
                type="datetime-local"
                name="endTime"
                value={bookingData.endTime}
                onChange={handleBookingChange}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              
              {bookingData.startTime && bookingData.endTime && selectedSlot && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Pricing Information</strong>
                  </Typography>
                  <Typography variant="body2">
                    <strong>Hourly Rate:</strong> ${selectedSlot.hourlyRate.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Note:</strong> The final amount will be calculated based on your booking duration.
                    A penalty fee may apply if you exceed your booked time.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBookingClose} color="primary">
            {bookingSuccess ? 'Close' : 'Cancel'}
          </Button>
          {!bookingSuccess && (
            <Button onClick={handleBookingSubmit} color="primary" variant="contained">
              Book
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParkingSlots;