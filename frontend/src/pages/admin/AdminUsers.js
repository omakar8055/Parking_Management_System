import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Grid, Paper, CircularProgress, Alert,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Chip, IconButton, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, FormControl, InputLabel, Select, MenuItem,
  Switch, FormControlLabel, Checkbox, ListItemText, OutlinedInput
} from '@mui/material';
import { 
  Person as PersonIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const AdminUsers = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState(''); // 'create', 'edit', or 'delete'
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    roles: ['ROLE_USER'],
    active: true
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const availableRoles = [
    'ROLE_USER',
    'ROLE_ADMIN'
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('/api/admin/users');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, user = null) => {
    setDialogMode(mode);
    setSelectedUser(user);
    
    if (mode === 'create') {
      setUserData({
        username: '',
        email: '',
        password: '',
        roles: ['ROLE_USER'],
        active: true
      });
    } else if (mode === 'edit' && user) {
      setUserData({
        username: user.username,
        email: user.email,
        password: '',
        roles: user.roles,
        active: user.active
      });
    }
    
    setOpenDialog(true);
    setActionSuccess('');
    setActionError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    if (actionSuccess) {
      fetchUsers();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRolesChange = (event) => {
    const { value } = event.target;
    setUserData(prev => ({
      ...prev,
      roles: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleActiveChange = (event) => {
    setUserData(prev => ({
      ...prev,
      active: event.target.checked
    }));
  };

  const handleSubmit = async () => {
    try {
      setActionLoading(true);
      setActionError('');
      
      let response;
      let message = '';
      
      if (dialogMode === 'create') {
        response = await axios.post('/api/admin/users', userData);
        message = 'User created successfully!';
      } else if (dialogMode === 'edit') {
        // Remove password if empty (not changing password)
        const dataToSend = { ...userData };

        if (!dataToSend.password) {
          delete dataToSend.password;
        }
        
        response = await axios.put(`/api/admin/users/${selectedUser.id}`, dataToSend);
        message = 'User updated successfully!';
      } else if (dialogMode === 'delete') {
        await axios.delete(`/api/admin/users/${selectedUser.id}`);
        message = 'User deleted successfully!';
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
        Manage Users
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('create')}
        >
          Add New User
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Alert severity="info">No users found.</Alert>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="users table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Roles</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow hover key={user.id}>
                      <TableCell>{user.id.substring(0, 8)}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.roles.map(role => (
                          <Chip 
                            key={role} 
                            label={role.replace('ROLE_', '')} 
                            color={role.includes('ADMIN') ? 'secondary' : 'primary'}
                            size="small"
                            sx={{ mr: 0.5 }}
                          />
                        ))}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.active ? 'Active' : 'Inactive'} 
                          color={user.active ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => handleOpenDialog('edit', user)}
                          title="Edit User"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => handleOpenDialog('delete', user)}
                          title="Delete User"
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
            count={users.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
      
      {/* User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' && 'Add New User'}
          {dialogMode === 'edit' && 'Edit User'}
          {dialogMode === 'delete' && 'Delete User'}
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
                  Are you sure you want to delete user {selectedUser?.username}?
                </Typography>
              ) : (
                <>
                  <TextField
                    label="Username"
                    name="username"
                    value={userData.username}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    required
                  />
                  
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    required
                  />
                  
                  <TextField
                    label={dialogMode === 'create' ? 'Password' : 'New Password (leave blank to keep current)'}
                    name="password"
                    type="password"
                    value={userData.password}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    required={dialogMode === 'create'}
                  />
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="roles-label">Roles</InputLabel>
                    <Select
                      labelId="roles-label"
                      multiple
                      value={userData.roles}
                      onChange={handleRolesChange}
                      input={<OutlinedInput label="Roles" />}
                      renderValue={(selected) => selected.map(role => role.replace('ROLE_', '')).join(', ')}
                    >
                      {availableRoles.map((role) => (
                        <MenuItem key={role} value={role}>
                          <Checkbox checked={userData.roles.indexOf(role) > -1} />
                          <ListItemText primary={role.replace('ROLE_', '')} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userData.active}
                        onChange={handleActiveChange}
                        name="active"
                        color="primary"
                      />
                    }
                    label="Active"
                    sx={{ mt: 2 }}
                  />
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

export default AdminUsers;