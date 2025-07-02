import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip, MenuItem
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const API = 'https://techclinic-api.techclinic-api.workers.dev/api/parts';

const defaultPart = {
  id: '', name: '', type: '', custom_type: '', company: '', custom_company: '', box_id: '', quantity: 1, repairing_cost: 0, selling_cost: 0, repairing_parts: ''
};
const types = ['Display', 'Battery', 'Speaker', 'Motherboard', 'Camera', 'Other'];
const companies = ['Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Other'];
const repairingParts = ['Repair', 'Replacement'];

export default function Parts() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(defaultPart);
  const { enqueueSnackbar } = useSnackbar();
  const token = localStorage.getItem('token');

  const fetchParts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setParts(res.data);
    } catch (e) {
      enqueueSnackbar('Failed to load parts', { variant: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchParts();
    // eslint-disable-next-line
  }, []);

  const handleOpen = (part = defaultPart) => {
    setForm(part);
    setEditMode(!!part.id);
    setOpen(true);
  };
  const handleClose = () => {
    setForm(defaultPart);
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
    if (!form.box_id) return enqueueSnackbar('Box ID is required', { variant: 'warning' });
    if (!form.repairing_parts) return enqueueSnackbar('Repairing Parts is required', { variant: 'warning' });
    if (!Number.isInteger(Number(form.quantity)) || Number(form.quantity) < 1) return enqueueSnackbar('Quantity must be a positive integer', { variant: 'warning' });
    if (isNaN(Number(form.repairing_cost)) || Number(form.repairing_cost) < 0) return enqueueSnackbar('Repairing cost must be non-negative', { variant: 'warning' });
    if (isNaN(Number(form.selling_cost)) || Number(form.selling_cost) < 0) return enqueueSnackbar('Selling cost must be non-negative', { variant: 'warning' });
    try {
      const payload = {
        ...form,
        type: form.type === 'Other' ? form.custom_type : form.type,
        company: form.company === 'Other' ? form.custom_company : form.company,
        quantity: Number(form.quantity),
        repairing_cost: Number(form.repairing_cost),
        selling_cost: Number(form.selling_cost),
      };
      if (editMode) {
        await axios.put(`${API}/${form.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        enqueueSnackbar('Part updated', { variant: 'success' });
      } else {
        await axios.post(API, { ...payload, id: crypto.randomUUID() }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        enqueueSnackbar('Part added', { variant: 'success' });
      }
      handleClose();
      fetchParts();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.error || 'Error saving part', { variant: 'error' });
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this part?')) return;
    try {
      await axios.delete(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      enqueueSnackbar('Part deleted', { variant: 'success' });
      fetchParts();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.error || 'Error deleting part', { variant: 'error' });
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Parts</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Add Part</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Box ID</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Repairing Cost</TableCell>
              <TableCell>Selling Cost</TableCell>
              <TableCell>Repairing Parts</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {parts.map(part => (
              <TableRow key={part.id}>
                <TableCell>{part.name}</TableCell>
                <TableCell>{part.type}</TableCell>
                <TableCell>{part.company}</TableCell>
                <TableCell>{part.box_id}</TableCell>
                <TableCell>{part.quantity}</TableCell>
                <TableCell>{part.repairing_cost}</TableCell>
                <TableCell>{part.selling_cost}</TableCell>
                <TableCell>{part.repairing_parts}</TableCell>
                <TableCell>
                  <Tooltip title="Edit"><IconButton onClick={() => handleOpen(part)}><Edit /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton color="error" onClick={() => handleDelete(part.id)}><Delete /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {parts.length === 0 && !loading && (
              <TableRow><TableCell colSpan={9} align="center">No parts found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Part' : 'Add Part'}</DialogTitle>
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
            label="Box ID"
            name="box_id"
            value={form.box_id}
            onChange={handleChange}
            fullWidth
            required
          />
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
            label="Repairing Cost"
            name="repairing_cost"
            type="number"
            value={form.repairing_cost}
            onChange={handleChange}
            fullWidth
            required
            inputProps={{ min: 0 }}
          />
          <TextField
            margin="normal"
            label="Selling Cost"
            name="selling_cost"
            type="number"
            value={form.selling_cost}
            onChange={handleChange}
            fullWidth
            required
            inputProps={{ min: 0 }}
          />
          <TextField
            margin="normal"
            label="Repairing Parts"
            name="repairing_parts"
            value={form.repairing_parts}
            onChange={handleChange}
            select
            fullWidth
            required
          >
            {repairingParts.map(rp => <MenuItem key={rp} value={rp}>{rp}</MenuItem>)}
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