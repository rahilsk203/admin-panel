import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const API = 'https://techclinic-api.techclinic-api.workers.dev/api/parts';
const BOXES_API = 'https://techclinic-api.techclinic-api.workers.dev/api/boxes';

const defaultPart = {
  id: '', name: '', type: '', custom_type: '', company: '', custom_company: '', box_id: '', quantity: 1, repairing_cost: 0, selling_cost: 0, repairing_parts: ''
};
const types = ['Display', 'Battery', 'Speaker', 'Motherboard', 'Camera', 'Other'];
const companies = ['Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Other'];
const repairingParts = ['Repair', 'Replacement'];

function IconEdit() {
  return (
    <svg className="w-5 h-5 text-blue-600 hover:text-blue-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h2v2H7v-2h2zm0 0v-2h2v2H9z" /></svg>
  );
}
function IconDelete() {
  return (
    <svg className="w-5 h-5 text-red-600 hover:text-red-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
  );
}
function IconAdd() {
  return (
    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
  );
}

export default function Parts() {
  const [parts, setParts] = useState([]);
  const [boxes, setBoxes] = useState([]);
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

  const fetchBoxes = async () => {
    try {
      const res = await axios.get(BOXES_API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBoxes(res.data);
    } catch (e) {
      enqueueSnackbar('Failed to load boxes', { variant: 'error' });
    }
  };

  useEffect(() => {
    fetchParts();
    fetchBoxes();
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
    if (!form.box_id) return enqueueSnackbar('Box is required', { variant: 'warning' });
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
    <div className="">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 px-2 sm:px-0">
        <h2 className="text-xl font-semibold text-gray-800">Parts</h2>
        <button
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition w-full sm:w-auto justify-center"
          onClick={() => handleOpen()}
        >
          <IconAdd /> Add Part
        </button>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow px-2 sm:px-0">
        <table className="min-w-[700px] w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Box</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Repairing Cost</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Selling Cost</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Repairing Parts</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {parts.map(part => (
              <tr key={part.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap">{part.name}</td>
                <td className="px-4 py-2 whitespace-nowrap">{part.type}</td>
                <td className="px-4 py-2 whitespace-nowrap">{part.company}</td>
                <td className="px-4 py-2 whitespace-nowrap">{boxes.find(b => b.id === part.box_id)?.name || ''}</td>
                <td className="px-4 py-2 whitespace-nowrap">{part.quantity}</td>
                <td className="px-4 py-2 whitespace-nowrap">{part.repairing_cost}</td>
                <td className="px-4 py-2 whitespace-nowrap">{part.selling_cost}</td>
                <td className="px-4 py-2 whitespace-nowrap">{part.repairing_parts}</td>
                <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                  <button title="Edit" onClick={() => handleOpen(part)} className="p-1 rounded hover:bg-blue-100"><IconEdit /></button>
                  <button title="Delete" onClick={() => handleDelete(part.id)} className="p-1 rounded hover:bg-red-100"><IconDelete /></button>
                </td>
              </tr>
            ))}
            {parts.length === 0 && !loading && (
              <tr><td colSpan={9} className="text-center py-4 text-gray-400">No parts found</td></tr>
            )}
          </tbody>
        </table>
        {loading && <div className="p-4 text-center text-gray-500">Loading...</div>}
      </div>
      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-auto p-0">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 pt-10 relative animate-[fadeInScale_0.3s_ease] border border-blue-100">
              <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 transition" aria-label="Close">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h3 className="text-2xl font-bold text-blue-700 mb-6 text-center tracking-tight">
                {editMode ? 'Edit Part' : 'Add Part'}
              </h3>
              <form
                onSubmit={e => { e.preventDefault(); handleSubmit(); }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">Name</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">Type</label>
                    <select
                      name="type"
                      value={types.includes(form.type) ? form.type : 'Other'}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                    >
                      {types.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  {form.type === 'Other' && (
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 mb-1 font-medium">Custom Type</label>
                      <input
                        name="custom_type"
                        value={form.custom_type}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">Company</label>
                    <select
                      name="company"
                      value={companies.includes(form.company) ? form.company : 'Other'}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                    >
                      {companies.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {form.company === 'Other' && (
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 mb-1 font-medium">Custom Company</label>
                      <input
                        name="custom_company"
                        value={form.custom_company}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">Box</label>
                    <select
                      name="box_id"
                      value={form.box_id}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                    >
                      <option value="">Select a box</option>
                      {boxes.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">Quantity</label>
                    <input
                      name="quantity"
                      type="number"
                      min="1"
                      value={form.quantity}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">Repairing Cost</label>
                    <input
                      name="repairing_cost"
                      type="number"
                      min="0"
                      value={form.repairing_cost}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">Selling Cost</label>
                    <input
                      name="selling_cost"
                      type="number"
                      min="0"
                      value={form.selling_cost}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">Repairing Parts</label>
                    <select
                      name="repairing_parts"
                      value={form.repairing_parts}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                    >
                      <option value=""></option>
                      {repairingParts.map(rp => <option key={rp} value={rp}>{rp}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button type="button" onClick={handleClose} className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition">Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-400 hover:from-blue-700 hover:to-purple-500 text-white font-semibold shadow transition">{editMode ? 'Update' : 'Add'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 