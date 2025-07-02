import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const API = 'https://techclinic-api.techclinic-api.workers.dev/api/accessories';
const BOXES_API = 'https://techclinic-api.techclinic-api.workers.dev/api/boxes';

const defaultAccessory = {
  id: '', name: '', type: '', custom_type: '', company: '', custom_company: '', price: '', quality: '', warranty: '', quantity: 1, category: '', box_id: ''
};
const types = ['Headphone', 'Charger', 'Case', 'Screen Protector', 'Cable', 'Other'];
const companies = ['Apple', 'Samsung', 'Anker', 'JBL', 'Sony', 'Other'];
const qualities = ['Original', 'OEM', 'Aftermarket', 'Refurbished'];
const warranties = ['None', '1 month', '3 months', '6 months', '1 year'];
const categories = ['Audio', 'Power', 'Protection', 'Other'];

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

export default function Accessories() {
  const [accessories, setAccessories] = useState([]);
  const [boxes, setBoxes] = useState([]);
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
    fetchAccessories();
    fetchBoxes();
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
    if (!form.box_id) return enqueueSnackbar('Box is required', { variant: 'warning' });
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
    <div className="">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Accessories</h2>
        <button
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
          onClick={() => handleOpen()}
        >
          <IconAdd /> Add Accessory
        </button>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Box</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quality</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Warranty</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {accessories.map(acc => (
              <tr key={acc.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap">{acc.name}</td>
                <td className="px-4 py-2 whitespace-nowrap">{acc.type}</td>
                <td className="px-4 py-2 whitespace-nowrap">{acc.company}</td>
                <td className="px-4 py-2 whitespace-nowrap">{boxes.find(b => b.id === acc.box_id)?.name || ''}</td>
                <td className="px-4 py-2 whitespace-nowrap">{acc.price}</td>
                <td className="px-4 py-2 whitespace-nowrap">{acc.quality}</td>
                <td className="px-4 py-2 whitespace-nowrap">{acc.warranty}</td>
                <td className="px-4 py-2 whitespace-nowrap">{acc.quantity}</td>
                <td className="px-4 py-2 whitespace-nowrap">{acc.category}</td>
                <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                  <button title="Edit" onClick={() => handleOpen(acc)} className="p-1 rounded hover:bg-blue-100"><IconEdit /></button>
                  <button title="Delete" onClick={() => handleDelete(acc.id)} className="p-1 rounded hover:bg-red-100"><IconDelete /></button>
                </td>
              </tr>
            ))}
            {accessories.length === 0 && !loading && (
              <tr><td colSpan={10} className="text-center py-4 text-gray-400">No accessories found</td></tr>
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
                {editMode ? 'Edit Accessory' : 'Add Accessory'}
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
                    <label className="block text-gray-700 mb-1 font-medium">Price</label>
                    <input
            name="price"
            type="number"
                      min="0"
            value={form.price}
            onChange={handleChange}
            required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">Quality</label>
                    <select
            name="quality"
            value={form.quality}
            onChange={handleChange}
            required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                    >
                      <option value=""></option>
                      {qualities.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">Warranty</label>
                    <select
            name="warranty"
            value={form.warranty}
            onChange={handleChange}
            required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                    >
                      <option value=""></option>
                      {warranties.map(w => <option key={w} value={w}>{w}</option>)}
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
                    <label className="block text-gray-700 mb-1 font-medium">Category</label>
                    <select
            name="category"
            value={form.category}
            onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                    >
                      <option value=""></option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
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
