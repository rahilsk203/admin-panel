import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Fade,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

// Placeholder for logo (replace with actual image or SVG)
import Logo from '../assets/logo.png'; // Add your logo file in the project directory

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('https://techclinic-api.techclinic-api.workers.dev/api/login', {
        username,
        password,
      });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      enqueueSnackbar(err.response?.data?.error || 'Login failed', { variant: 'error' });
    }
    setLoading(false);
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(135deg, #6e8efb, #a777e3)', // Gradient background
        p: 2,
      }}
    >
      <Fade in timeout={800}>
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 4 },
            minWidth: { xs: 300, sm: 340 },
            maxWidth: 400,
            borderRadius: 3,
            bgcolor: 'white',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)', // Enhanced shadow
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)', // Subtle lift effect on hover
            },
          }}
        >
          {/* Logo Section */}
          <Box display="flex" justifyContent="center" mb={3}>
            {Logo ? (
              <img
                src={Logo}
                alt="Tech Clinic Admin Logo"
                style={{ maxWidth: '150px', height: 'auto' }}
              />
            ) : (
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: '#3f51b5',
                  textAlign: 'center',
                  letterSpacing: 1.2,
                }}
              >
                Tech Clinic Admin
              </Typography>
            )}
          </Box>

          <Typography
            variant="h5"
            mb={3}
            align="center"
            sx={{ fontWeight: 600, color: '#333' }}
          >
            Admin Login
          </Typography>

          <form onSubmit={handleSubmit} autoComplete="off">
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              margin="normal"
              required
              autoFocus
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '&:hover fieldset': {
                    borderColor: '#3f51b5',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3f51b5',
                  },
                },
              }}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '&:hover fieldset': {
                    borderColor: '#3f51b5',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3f51b5',
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                      sx={{ color: '#3f51b5' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                py: 1.5,
                borderRadius: '8px',
                background: 'linear-gradient(90deg, #3f51b5, #7986cb)', // Gradient button
                boxShadow: '0 4px 12px rgba(63, 81, 181, 0.3)',
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 500,
                '&:hover': {
                  background: 'linear-gradient(90deg, #303f9f, #5c6bc0)',
                  boxShadow: '0 6px 16px rgba(63, 81, 181, 0.4)',
                },
                '&:disabled': {
                  background: '#bdbdbd',
                  cursor: 'not-allowed',
                },
              }}
              disabled={loading}
              endIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </Paper>
      </Fade>
    </Box>
  );
}