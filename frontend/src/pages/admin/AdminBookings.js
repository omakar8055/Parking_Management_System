import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Grid, Paper, CircularProgress, Alert,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, IconButton, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination
} from '@mui/material';
import { 
  BookOnline as BookingIcon,
  Check as CompleteIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const AdminBookings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState(''); // 'complete', 'cancel', or 'delete'
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('/api/bookings');
      setBookings(response.data);
    } catch (err) {
      setError('Failed to load bookings. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (booking, action) => {
    setSelectedBooking(booking);
    setDialogAction(action);
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

  const handleAction = async () => {
    try {
      setActionLoading(true);
      setActionError('');
      
      let message = '';
      
      switch (dialogAction) {
        case 'complete':
          await axios.put(`/api/bookings/complete/${selectedBooking.id}`);
          message = 'Booking completed successfully!';
          break;
        case 'cancel':
          await axios.put(`/api/bookings/cancel/${selectedBooking.id}`);
          message = 'Booking cancelled successfully!';
          break;
        case 'delete':
          await axios.delete(`/api/bookings/${selectedBooking.id}`);
          message = 'Booking deleted successfully!';
          break;
        default:
          throw new Error('Invalid action');
      }
      
      setActionSuccess(message);
      setTimeout(() => {
        handleCloseDialog();
      }, 2000);
    } catch (err) {
      setActionError(err.response?.data || 'Action failed. Please try again.');
      console.error(err);
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
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manage Bookings
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : bookings.length === 0 ? (
        <Alert severity="info">No bookings found.</Alert>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="bookings table">
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>User ID</TableCell>
                  <TableCell>Slot ID</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Booking Amount</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Penalty</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((booking) => (
                    <TableRow hover key={booking.id}>
                      <TableCell>{booking.id.substring(0, 8)}</TableCell>
                      <TableCell>{booking.userId.substring(0, 8)}</TableCell>
                      <TableCell>{booking.slotId.substring(0, 8)}</TableCell>
                      <TableCell>{booking.startTime}</TableCell>
                      <TableCell>{booking.endTime}</TableCell>
                      <TableCell>{getStatusChip(booking.status)}</TableCell>
                      <TableCell>${booking.bookingAmount.toFixed(2)}</TableCell>
                      <TableCell>${booking.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        {booking.penalty ? 
                          `$${booking.penaltyAmount.toFixed(2)}` : 
                          'None'}
                      </TableCell>
                      <TableCell>
                        {booking.status === 'ACTIVE' && (
                          <>
                            <IconButton 
                              color="success" 
                              size="small"
                              onClick={() => handleOpenDialog(booking, 'complete')}
                              title="Complete Booking"
                            >
                              <CompleteIcon />
                            </IconButton>
                            <IconButton 
                              color="error" 
                              size="small"
                              onClick={() => handleOpenDialog(booking, 'cancel')}
                              title="Cancel Booking"
                            >
                              <CancelIcon />
                            </IconButton>
                          </>
                        )}
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => handleOpenDialog(booking, 'delete')}
                          title="Delete Booking"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={bookings.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
      
      {/* Action Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogAction === 'complete' && 'Complete Booking'}
          {dialogAction === 'cancel' && 'Cancel Booking'}
          {dialogAction === 'delete' && 'Delete Booking'}
        </DialogTitle>
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
              
              <Typography variant="body1">
                Are you sure you want to {dialogAction} booking #{selectedBooking?.id.substring(0, 8)}?
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {actionSuccess ? 'Close' : 'Cancel'}
          </Button>
          {!actionSuccess && (
            <Button 
              onClick={handleAction} 
              color={dialogAction === 'delete' ? 'error' : dialogAction === 'complete' ? 'success' : 'primary'}
              variant="contained"
              disabled={actionLoading}
            >
              Confirm
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminBookings;