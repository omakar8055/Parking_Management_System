import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, Container, Typography, TextField, Button, 
  Paper, Alert, CircularProgress
} from '@mui/material';
import { LockOutlined as LockIcon } from '@mui/icons-material';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!formData.username || !formData.password) {
      return setError('Please fill in all fields');
    }
    
    try {
      setLoading(true);
      await login(formData.username, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data || 'Login failed. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <LockIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography component="h1" variant="h5">
              Sign In
            </Typography>
          </Box>
          
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;