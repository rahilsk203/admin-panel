import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip, InputAdornment
} from '@mui/material';
import { Add, Edit, Delete, Visibility, VisibilityOff } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const API = 'https://techclinic-api.techclinic-api.workers.dev/api/admins';
const REGISTER_API = 'https://techclinic-api.techclinic-api.workers.dev/api/register';

const defaultAdmin = { id: '', username: '', password: '' };

export default function Admins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(defaultAdmin);
  const [showPassword, setShowPassword] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(atob(token.split('.')[1])).username;

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(res.data);
    } catch (e) {
      enqueueSnackbar('Failed to load admins', { variant: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
    // eslint-disable-next-line
  }, []);

  const handleOpen = (admin = defaultAdmin) => {
    setForm(admin);
    setEditMode(!!admin.id);
    setOpen(true);
  };
  const handleClose = () => {
    setForm(defaultAdmin);
    setEditMode(false);
    setOpen(false);
    setShowPassword(false);
  };

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.username) return enqueueSnackbar('Username is required', { variant: 'warning' });
    if (!editMode && !form.password) return enqueueSnackbar('Password is required', { variant: 'warning' });
    try {
      if (editMode) {
        await axios.put(`${API}/${form.id}`, { username: form.username, password: form.password || undefined }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        enqueueSnackbar('Admin updated', { variant: 'success' });
      } else {
        await axios.post(REGISTER_API, { username: form.username, password: form.password, register_key: 'techclinic@superadmin' });
        enqueueSnackbar('Admin added', { variant: 'success' });
      }
      handleClose();
      fetchAdmins();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.error || 'Error saving admin', { variant: 'error' });
    }
  };

  const handleDelete = async (id, username) => {
    if (username === currentUser) return enqueueSnackbar('You cannot delete yourself', { variant: 'warning' });
    if (!window.confirm('Delete this admin?')) return;
    try {
      await axios.delete(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      enqueueSnackbar('Admin deleted', { variant: 'success' });
      fetchAdmins();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.error || 'Error deleting admin', { variant: 'error' });
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Admins</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Add Admin</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {admins.map(admin => (
              <TableRow key={admin.id}>
                <TableCell>{admin.username}</TableCell>
                <TableCell>{admin.created_at ? new Date(admin.created_at).toLocaleString() : ''}</TableCell>
                <TableCell>
                  <Tooltip title="Edit"><IconButton onClick={() => handleOpen(admin)}><Edit /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton color="error" onClick={() => handleDelete(admin.id, admin.username)}><Delete /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {admins.length === 0 && !loading && (
              <TableRow><TableCell colSpan={3} align="center">No admins found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{editMode ? 'Edit Admin' : 'Add Admin'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            margin="normal"
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            fullWidth
            required={!editMode}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(s => !s)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            helperText={editMode ? 'Leave blank to keep current password' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editMode ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 