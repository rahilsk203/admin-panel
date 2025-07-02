import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip, MenuItem
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const API = 'https://techclinic-api.techclinic-api.workers.dev/api/accessories';

const defaultAccessory = {
  id: '', name: '', type: '', custom_type: '', company: '', custom_company: '', price: '', quality: '', warranty: '', quantity: 1, category: ''
};
const types = ['Headphone', 'Charger', 'Case', 'Screen Protector', 'Cable', 'Other'];
const companies = ['Apple', 'Samsung', 'Anker', 'JBL', 'Sony', 'Other'];
const qualities = ['Original', 'OEM', 'Aftermarket', 'Refurbished'];
const warranties = ['None', '1 month', '3 months', '6 months', '1 year'];
const categories = ['Audio', 'Power', 'Protection', 'Other'];

export default function Accessories() {
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(defaultAccessory);
  const { enqueueSnackbar } = useSnackbar();
  const token = localStorage.getItem('token');

  const fetchAccessories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccessories(res.data);
    } catch (e) {
      enqueueSnackbar('Failed to load accessories', { variant: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAccessories();
    // eslint-disable-next-line
  }, []);

  const handleOpen = (acc = defaultAccessory) => {
    setForm(acc);
    setEditMode(!!acc.id);
    setOpen(true);
  };
  const handleClose = () => {
    setForm(defaultAccessory);
    setEditMode(false);
    setOpen(false);
  };

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.name) return enqueueSnackbar('Name is required', { variant: 'warning' });
    if (!form.type) return enqueueSnackbar('Type is required', { variant: 'warning' });
    if (form.type === 'Other' && !form.custom_type.trim()) return enqueueSnackbar('Custom type required', { variant: 'warning' });
    if (!form.company) return enqueueSnackbar('Company is required', { variant: 'warning' });
    if (form.company === 'Other' && !form.custom_company.trim()) return enqueueSnackbar('Custom company required', { variant: 'warning' });
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) return enqueueSnackbar('Price must be a non-negative number', { variant: 'warning' });
    if (!form.quality) return enqueueSnackbar('Quality is required', { variant: 'warning' });
    if (!form.warranty) return enqueueSnackbar('Warranty is required', { variant: 'warning' });
    if (!Number.isInteger(Number(form.quantity)) || Number(form.quantity) < 1) return enqueueSnackbar('Quantity must be a positive integer', { variant: 'warning' });
    try {
      const payload = {
        ...form,
        type: form.type === 'Other' ? form.custom_type : form.type,
        company: form.company === 'Other' ? form.custom_company : form.company,
        price: Number(form.price),
        quantity: Number(form.quantity),
      };
      if (editMode) {
        await axios.put(`${API}/${form.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        enqueueSnackbar('Accessory updated', { variant: 'success' });
      } else {
        await axios.post(API, { ...payload, id: crypto.randomUUID() }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        enqueueSnackbar('Accessory added', { variant: 'success' });
      }
      handleClose();
      fetchAccessories();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.error || 'Error saving accessory', { variant: 'error' });
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this accessory?')) return;
    try {
      await axios.delete(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      enqueueSnackbar('Accessory deleted', { variant: 'success' });
      fetchAccessories();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.error || 'Error deleting accessory', { variant: 'error' });
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Accessories</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Add Accessory</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Quality</TableCell>
              <TableCell>Warranty</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accessories.map(acc => (
              <TableRow key={acc.id}>
                <TableCell>{acc.name}</TableCell>
                <TableCell>{acc.type}</TableCell>
                <TableCell>{acc.company}</TableCell>
                <TableCell>{acc.price}</TableCell>
                <TableCell>{acc.quality}</TableCell>
                <TableCell>{acc.warranty}</TableCell>
                <TableCell>{acc.quantity}</TableCell>
                <TableCell>{acc.category}</TableCell>
                <TableCell>
                  <Tooltip title="Edit"><IconButton onClick={() => handleOpen(acc)}><Edit /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton color="error" onClick={() => handleDelete(acc.id)}><Delete /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {accessories.length === 0 && !loading && (
              <TableRow><TableCell colSpan={9} align="center">No accessories found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Accessory' : 'Add Accessory'}</DialogTitle>
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
            label="Type"
            name="type"
            value={types.includes(form.type) ? form.type : 'Other'}
            onChange={handleChange}
            select
            fullWidth
            required
          >
            {types.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
          {form.type === 'Other' && (
            <TextField
              margin="normal"
              label="Custom Type"
              name="custom_type"
              value={form.custom_type}
              onChange={handleChange}
              fullWidth
              required
            />
          )}
          <TextField
            margin="normal"
            label="Company"
            name="company"
            value={companies.includes(form.company) ? form.company : 'Other'}
            onChange={handleChange}
            select
            fullWidth
            required
          >
            {companies.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
          {form.company === 'Other' && (
            <TextField
              margin="normal"
              label="Custom Company"
              name="custom_company"
              value={form.custom_company}
              onChange={handleChange}
              fullWidth
              required
            />
          )}
          <TextField
            margin="normal"
            label="Price"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            fullWidth
            required
            inputProps={{ min: 0 }}
          />
          <TextField
            margin="normal"
            label="Quality"
            name="quality"
            value={form.quality}
            onChange={handleChange}
            select
            fullWidth
            required
          >
            {qualities.map(q => <MenuItem key={q} value={q}>{q}</MenuItem>)}
          </TextField>
          <TextField
            margin="normal"
            label="Warranty"
            name="warranty"
            value={form.warranty}
            onChange={handleChange}
            select
            fullWidth
            required
          >
            {warranties.map(w => <MenuItem key={w} value={w}>{w}</MenuItem>)}
          </TextField>
          <TextField
            margin="normal"
            label="Quantity"
            name="quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
            fullWidth
            required
            inputProps={{ min: 1 }}
          />
          <TextField
            margin="normal"
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            select
            fullWidth
          >
            <MenuItem value=""></MenuItem>
            {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
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