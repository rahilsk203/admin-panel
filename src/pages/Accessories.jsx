import React, { useEffect, useState, useRef } from 'react';
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

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-xl shadow p-4 flex flex-col gap-2 min-h-[120px]">
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-3 bg-gray-200 rounded w-1/4" />
      <div className="flex gap-2 mt-2">
        <div className="h-8 w-16 bg-gray-200 rounded" />
        <div className="h-8 w-16 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <div className="text-lg font-semibold">No accessories found</div>
      <div className="text-sm">Start by adding a new accessory.</div>
    </div>
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
  const [isClosing, setIsClosing] = useState(false);
  const drawerRef = useRef();

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
    setIsClosing(false);
  };
  const handleClose = () => {
    setIsClosing(true);
  };

  // Unmount drawer after animation
  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => {
        setOpen(false);
        setIsClosing(false);
      }, 300); // match animation duration
      return () => clearTimeout(timer);
    }
  }, [isClosing]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <div className="max-w-5xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-8">
        <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 tracking-tight">Accessories</h2>
        <button
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 text-white font-semibold px-6 py-2 rounded-xl shadow-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={() => handleOpen()}
        >
          <IconAdd /> Add Accessory
        </button>
      </div>
      <div className="border-b border-blue-100 dark:border-gray-800 mb-6" />
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : accessories.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {accessories.map(acc => (
            <div key={acc.id} className="bg-white/90 dark:bg-[#23263a]/90 rounded-xl shadow-lg p-6 flex flex-col gap-2 transition hover:shadow-2xl group border border-blue-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-400">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-blue-700 dark:text-blue-300 group-hover:text-purple-600 transition">{acc.name}</div>
                <div className="flex gap-1">
                  <button title="Edit" aria-label="Edit" onClick={() => handleOpen(acc)} className="p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"><IconEdit /></button>
                  <button title="Delete" aria-label="Delete" onClick={() => handleDelete(acc.id)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-400"><IconDelete /></button>
                </div>
              </div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">Type: <span className="font-medium text-gray-700 dark:text-gray-100">{acc.type || '-'}</span></div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">Company: <span className="font-medium text-gray-700 dark:text-gray-100">{acc.company || '-'}</span></div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">Box: <span className="font-medium text-gray-700 dark:text-gray-100">{boxes.find(b => b.id === acc.box_id)?.name || '-'}</span></div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">Price: <span className="font-medium text-gray-700 dark:text-gray-100">₹{acc.price}</span></div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">Quality: <span className="font-medium text-gray-700 dark:text-gray-100">{acc.quality}</span></div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">Warranty: <span className="font-medium text-gray-700 dark:text-gray-100">{acc.warranty}</span></div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">Quantity: <span className="font-medium text-gray-700 dark:text-gray-100">{acc.quantity}</span></div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">Category: <span className="font-medium text-gray-700 dark:text-gray-100">{acc.category}</span></div>
            </div>
          ))}
        </div>
      )}
      {/* Drawer Modal */}
      {open && (
        <div className={`fixed inset-0 z-40 flex items-end sm:items-center justify-end ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
          {/* Overlay click closes drawer on mobile */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} tabIndex={-1} aria-label="Close drawer" />
          <div
            ref={drawerRef}
            className={`relative w-full sm:w-[440px] h-full bg-white/95 dark:bg-[#23263a]/95 shadow-2xl border-l border-blue-100 dark:border-gray-800 animate-slideInRight flex flex-col max-w-full rounded-l-2xl sm:rounded-l-3xl
              ${isClosing ? 'animate-slideOutRight' : 'animate-slideInRight'}`}
            style={{ boxShadow: '0 8px 32px 0 rgba(60,60,120,0.18), 0 1.5px 8px 0 rgba(60,60,120,0.10)' }}
          >
            <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-full p-2 bg-white/80 dark:bg-[#23263a]/80 z-10" aria-label="Close">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-2 text-center tracking-tight px-6 pt-10">{editMode ? 'Edit Accessory' : 'Add Accessory'}</h3>
            <div className="border-b border-blue-100 dark:border-gray-800 mb-4 mx-6" />
            <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-24 flex-1 overflow-y-auto">
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70 dark:bg-[#23263a]/80 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                >
                  <option value=""></option>
                  {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {form.type === 'Other' && (
                  <input
                    name="custom_type"
                    value={form.custom_type}
                    onChange={handleChange}
                    placeholder="Custom type"
                    className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                  />
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Company</label>
                <select
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                >
                  <option value=""></option>
                  {companies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {form.company === 'Other' && (
                  <input
                    name="custom_company"
                    value={form.custom_company}
                    onChange={handleChange}
                    placeholder="Custom company"
                    className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                  />
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Box</label>
                <select
                  name="box_id"
                  value={form.box_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                >
                  <option value=""></option>
                  {boxes.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">Price (₹)</label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">Quantity</label>
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">Quality</label>
                  <select
                    name="quality"
                    value={form.quality}
                    onChange={handleChange}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                  >
                    <option value=""></option>
                    {warranties.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                >
                  <option value=""></option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="h-24 sm:hidden" />
            </form>
            {/* Sticky Save/Cancel for mobile and desktop */}
            <div className="absolute bottom-0 left-0 w-full bg-white/95 dark:bg-[#23263a]/95 border-t border-blue-100 dark:border-gray-800 flex justify-end gap-2 px-6 py-4 z-50 rounded-b-2xl shadow-lg">
              <button type="button" onClick={handleClose} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-100 font-semibold shadow">Cancel</button>
              <button type="submit" form="accessory-form" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow">{editMode ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
