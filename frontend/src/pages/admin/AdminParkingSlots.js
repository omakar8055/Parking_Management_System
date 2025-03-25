import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Grid, Paper, CircularProgress, Alert,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Chip, IconButton, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { 
  LocalParking as ParkingIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const AdminParkingSlots = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [parkingSlots, setParkingSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState(''); // 'create', 'edit', or 'delete'
  const [slotData, setSlotData] = useState({
    slotNumber: '',
    status: 'AVAILABLE',
    hourlyRate: ''
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchParkingSlots();
  }, []);

  const fetchParkingSlots = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('/api/parking-slots');
      setParkingSlots(response.data);
    } catch (err) {
      setError('Failed to load parking slots. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, slot = null) => {
    setDialogMode(mode);
    setSelectedSlot(slot);
    
    if (mode === 'create') {
      setSlotData({
        slotNumber: '',
        status: 'AVAILABLE',
        hourlyRate: ''
      });
    } else if (mode === 'edit' && slot) {
      setSlotData({
        slotNumber: slot.slotNumber,
        status: slot.status,
        hourlyRate: slot.hourlyRate
      });
    }
    
    setOpenDialog(true);
    setActionSuccess('');
    setActionError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSlot(null);
    if (actionSuccess) {
      fetchParkingSlots();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSlotData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setActionLoading(true);
      setActionError('');
      
      let response;
      let message = '';
      
      if (dialogMode === 'create') {
        response = await axios.post('/api/parking-slots', slotData);
        message = 'Parking slot created successfully!';
      } else if (dialogMode === 'edit') {
        response = await axios.put(`/api/parking-slots/${selectedSlot.id}`, slotData);
        message = 'Parking slot updated successfully!';
      } else if (dialogMode === 'delete') {
        await axios.delete(`/api/parking-slots/${selectedSlot.id}`);
        message = 'Parking slot deleted successfully!';
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
      case 'AVAILABLE':
        return <Chip label="Available" color="success" size="small" />;
      case 'OCCUPIED':
        return <Chip label="Occupied" color="error" size="small" />;
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
        Manage Parking Slots
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('create')}
        >
          Add New Parking Slot
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : parkingSlots.length === 0 ? (
        <Alert severity="info">No parking slots found.</Alert>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="parking slots table">
              <TableHead>
                <TableRow>
                  <TableCell>Slot ID</TableCell>
                  <TableCell>Slot Number</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Hourly Rate ($)</TableCell>
                  <TableCell>Booked By</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parkingSlots
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((slot) => (
                    <TableRow hover key={slot.id}>
                      <TableCell>{slot.id.substring(0, 8)}</TableCell>
                      <TableCell>{slot.slotNumber}</TableCell>
                      <TableCell>{getStatusChip(slot.status)}</TableCell>
                      <TableCell>{slot.hourlyRate ? `$${slot.hourlyRate.toFixed(2)}` : 'N/A'}</TableCell>
                      <TableCell>{slot.bookedBy || 'N/A'}</TableCell>
                      <TableCell>{slot.startTime || 'N/A'}</TableCell>
                      <TableCell>{slot.endTime || 'N/A'}</TableCell>
                      <TableCell>
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => handleOpenDialog('edit', slot)}
                          title="Edit Slot"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => handleOpenDialog('delete', slot)}
                          title="Delete Slot"
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
            count={parkingSlots.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
      
      {/* Slot Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogMode === 'create' && 'Add New Parking Slot'}
          {dialogMode === 'edit' && 'Edit Parking Slot'}
          {dialogMode === 'delete' && 'Delete Parking Slot'}
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
              
              {dialogMode === 'delete' ? (
                <Typography variant="body1">
                  Are you sure you want to delete parking slot {selectedSlot?.slotNumber}?
                </Typography>
              ) : (
                <>
                  <TextField
                    label="Slot Number"
                    name="slotNumber"
                    value={slotData.slotNumber}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    required
                  />
                  
                  <TextField
                    label="Hourly Rate ($)"
                    name="hourlyRate"
                    type="number"
                    value={slotData.hourlyRate}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    inputProps={{ min: 0, step: 0.01 }}
                    helperText="Leave empty to use default rate"
                  />
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      name="status"
                      value={slotData.status}
                      onChange={handleInputChange}
                      label="Status"
                    >
                      <MenuItem value="AVAILABLE">Available</MenuItem>
                      <MenuItem value="OCCUPIED">Occupied</MenuItem>
                    </Select>
                  </FormControl>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {actionSuccess ? 'Close' : 'Cancel'}
          </Button>
          {!actionSuccess && (
            <Button 
              onClick={handleSubmit} 
              color={dialogMode === 'delete' ? 'error' : 'primary'}
              variant="contained"
              disabled={actionLoading}
            >
              {dialogMode === 'create' && 'Create'}
              {dialogMode === 'edit' && 'Update'}
              {dialogMode === 'delete' && 'Delete'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminParkingSlots;