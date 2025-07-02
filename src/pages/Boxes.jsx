import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const API = 'https://techclinic-api.techclinic-api.workers.dev/api/boxes';

const defaultBox = { id: '', name: '', location: '', company: '', parts_type: '' };
const companies = ['Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Other'];
const partsTypes = ['Display', 'Battery', 'Speaker', 'Charger', 'Other'];

export default function Boxes() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(defaultBox);
  const { enqueueSnackbar } = useSnackbar();

  const token = localStorage.getItem('token');

  const fetchBoxes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBoxes(res.data);
    } catch (e) {
      enqueueSnackbar('Failed to load boxes', { variant: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBoxes();
    // eslint-disable-next-line
  }, []);

  const handleOpen = (box = defaultBox) => {
    setForm(box);
    setEditMode(!!box.id);
    setOpen(true);
  };
  const handleClose = () => {
    setForm(defaultBox);
    setEditMode(false);
    setOpen(false);
  };

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    try {
      if (!form.name) {
        enqueueSnackbar('Name is required', { variant: 'warning' });
        return;
      }
      if (editMode) {
        await axios.put(`${API}/${form.id}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        enqueueSnackbar('Box updated', { variant: 'success' });
      } else {
        await axios.post(API, { ...form, id: crypto.randomUUID() }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        enqueueSnackbar('Box added', { variant: 'success' });
      }
      handleClose();
      fetchBoxes();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.error || 'Error saving box', { variant: 'error' });
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this box?')) return;
    try {
      await axios.delete(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      enqueueSnackbar('Box deleted', { variant: 'success' });
      fetchBoxes();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.error || 'Error deleting box', { variant: 'error' });
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Boxes</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Add Box</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Parts Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {boxes.map(box => (
              <TableRow key={box.id}>
                <TableCell>{box.name}</TableCell>
                <TableCell>{box.location}</TableCell>
                <TableCell>{box.company}</TableCell>
                <TableCell>{box.parts_type}</TableCell>
                <TableCell>
                  <Tooltip title="Edit"><IconButton onClick={() => handleOpen(box)}><Edit /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton color="error" onClick={() => handleDelete(box.id)}><Delete /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {boxes.length === 0 && !loading && (
              <TableRow><TableCell colSpan={5} align="center">No boxes found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>{editMode ? 'Edit Box' : 'Add Box'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            margin="normal"
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="normal"
            label="Company"
            name="company"
            value={form.company}
            onChange={handleChange}
            select
            fullWidth
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            {companies.map(c => <option key={c} value={c}>{c}</option>)}
          </TextField>
          <TextField
            margin="normal"
            label="Parts Type"
            name="parts_type"
            value={form.parts_type}
            onChange={handleChange}
            select
            fullWidth
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            {partsTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editMode ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 