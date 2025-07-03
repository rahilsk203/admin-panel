import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { Tooltip } from 'react-tooltip';
import { Pencil, Trash2, Plus, X, Package2, Search } from 'lucide-react';

const API = 'https://techclinic-api.techclinic-api.workers.dev/api/accessories';
const BOXES_API = 'https://techclinic-api.techclinic-api.workers.dev/api/boxes';

const defaultAccessory = {
  id: '',
  name: '',
  type: '',
  custom_type: '',
  company: '',
  custom_company: '',
  price: '',
  quality: '',
  warranty: '',
  quantity: 1,
  category: '',
  box_id: '',
};
const types = ['Headphone', 'Charger', 'Case', 'Screen Protector', 'Cable', 'Other'];
const companies = ['Apple', 'Samsung', 'Anker', 'JBL', 'Sony', 'Other'];
const qualities = ['Original', 'OEM', 'Aftermarket', 'Refurbished'];
const warranties = ['None', '1 month', '3 months', '6 months', '1 year'];
const categories = ['Audio', 'Power', 'Protection', 'Other'];

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col gap-3">
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/4" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
      <Package2 className="w-20 h-20 mb-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
      <div className="text-xl font-semibold">No accessories found</div>
      <div className="text-sm mt-1">Start by adding a new accessory.</div>
    </div>
  );
}

function Accessories() {
  const [accessories, setAccessories] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(defaultAccessory);
  const [search, setSearch] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const token = localStorage.getItem('token');
  const [isClosing, setIsClosing] = useState(false);
  const drawerRef = useRef();

  const fetchAccessories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccessories(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      enqueueSnackbar('Failed to load accessories', { variant: 'error' });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const fetchBoxes = async () => {
    try {
      const res = await axios.get(BOXES_API, {
        headers: { Authorization: `Bearer ${token}` }, // Fixed syntax
      });
      setBoxes(Array.isArray(res.data) ? res.data : []);
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

  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => {
        setOpen(false);
        setIsClosing(false);
        setForm(defaultAccessory);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isClosing]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    setLoading(true);
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
          headers: { Authorization: `Bearer ${token}` },
        });
        enqueueSnackbar('Accessory updated', { variant: 'success' });
      } else {
        await axios.post(API, { ...payload, id: crypto.randomUUID() }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        enqueueSnackbar('Accessory added', { variant: 'success' });
      }
      handleClose();
      fetchAccessories();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.error || 'Error saving accessory', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this accessory?')) return;
    setLoading(true);
    try {
      await axios.delete(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      enqueueSnackbar('Accessory deleted', { variant: 'success' });
      fetchAccessories();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.error || 'Error deleting accessory', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Filtered accessories
  const filteredAccessories = accessories.filter(acc =>
    acc.name?.toLowerCase().includes(search.toLowerCase()) ||
    acc.type?.toLowerCase().includes(search.toLowerCase())
  );

  // Global loading state
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen" aria-label="Loading accessories">
        <svg className="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 min-h-screen">
      <div className="flex flex-col items-start sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">Accessories</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or type"
              className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
              value={search}
              onChange={e => setSearch(e.target.value)}
              data-tooltip-id="search-input"
              data-tooltip-content="Search accessories"
            />
            <Tooltip id="search-input" place="top-start" className="hidden sm:block" />
          </div>
          <button
            className="px-4 py-2 text-sm sm:text-base rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 transition-transform duration-200 hover:scale-105 w-full sm:w-auto"
            onClick={() => handleOpen()}
            data-tooltip-id="add-accessory"
            data-tooltip-content="Add a new accessory"
          >
            <Plus className="w-5 h-5" />
            Add Accessory
          </button>
          <Tooltip id="add-accessory" place="top-start" className="hidden sm:block" />
        </div>
      </div>
      <div className="border-b border-gray-200/50 dark:border-gray-700/50 mb-6" />
      {open && (
        <div
          className={`fixed inset-0 z-50 flex items-end sm:items-center justify-end transition-all duration-300 ${
            isClosing ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            role="button"
            aria-label="Close drawer"
            tabIndex={-1}
          />
          <div
            ref={drawerRef}
            className={`relative w-full sm:w-[480px] sm:max-w-[90vw] bg-gradient-to-b from-white/90 to-gray-100/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-md shadow-2xl border-l border-gray-200/50 dark:border-gray-700/50 flex flex-col rounded-l-3xl sm:rounded-t-none transition-transform duration-300 ease-in-out ${
              isClosing ? 'translate-x-full' : 'translate-x-0'
            }`}
            style={{ boxShadow: '0 8px 32px 0 rgba(60,60,120,0.18), 0 1.5px 8px 0 rgba(60,60,120,0.10)' }}
          >
            <div className="flex-1 flex flex-col h-full max-h-[calc(100vh-80px)]">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-transform duration-200 hover:scale-110 rounded-full p-3 bg-white/50 dark:bg-gray-800/50"
                aria-label="Close drawer"
                data-tooltip-id="close-drawer"
                data-tooltip-content="Close"
              >
                <X className="w-6 h-6" />
              </button>
              <Tooltip id="close-drawer" place="top-start" className="hidden sm:block" />
              <h3 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2 text-center tracking-tight px-4 sm:px-6 pt-10">
                {editMode ? 'Edit Accessory' : 'Add Accessory'}
              </h3>
              <div className="border-b border-gray-200/50 dark:border-gray-700/50 mb-6 mx-4 sm:mx-6" />
              <form
                id="accessory-form"
                onSubmit={handleSubmit}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-6 pb-24 flex-1 overflow-y-auto"
              >
                <div className="sm:col-span-2">
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                    data-tooltip-id="name-input"
                    data-tooltip-content="Enter accessory name"
                  />
                  <Tooltip id="name-input" place="top-start" className="hidden sm:block" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                  >
                    <option value="">Select Type</option>
                    {types.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <Tooltip id="type-input" place="top-start" className="hidden sm:block" data-tooltip-content="Select accessory type" />
                  {form.type === 'Other' && (
                    <input
                      name="custom_type"
                      value={form.custom_type}
                      onChange={handleChange}
                      placeholder="Custom type"
                      className="w-full mt-2 px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                      data-tooltip-id="custom-type-input"
                      data-tooltip-content="Enter custom type"
                    />
                  )}
                  <Tooltip id="custom-type-input" place="top-start" className="hidden sm:block" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Company</label>
                  <select
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                  >
                    <option value="">Select Company</option>
                    {companies.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <Tooltip id="company-input" place="top-start" className="hidden sm:block" data-tooltip-content="Select company" />
                  {form.company === 'Other' && (
                    <input
                      name="custom_company"
                      value={form.custom_company}
                      onChange={handleChange}
                      placeholder="Custom company"
                      className="w-full mt-2 px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                      data-tooltip-id="custom-company-input"
                      data-tooltip-content="Enter custom company"
                    />
                  )}
                  <Tooltip id="custom-company-input" place="top-start" className="hidden sm:block" />
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Box</label>
                  <select
                    name="box_id"
                    value={form.box_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                  >
                    <option value="">Select Box</option>
                    {boxes.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <Tooltip id="box-input" place="top-start" className="hidden sm:block" data-tooltip-content="Select storage box" />
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Price (₹)</label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                    data-tooltip-id="price-input"
                    data-tooltip-content="Enter price"
                  />
                  <Tooltip id="price-input" place="top-start" className="hidden sm:block" />
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                    data-tooltip-id="quantity-input"
                    data-tooltip-content="Enter quantity"
                  />
                  <Tooltip id="quantity-input" place="top-start" className="hidden sm:block" />
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Quality</label>
                  <select
                    name="quality"
                    value={form.quality}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                  >
                    <option value="">Select Quality</option>
                    {qualities.map(q => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                  <Tooltip id="quality-input" place="top-start" className="hidden sm:block" data-tooltip-content="Select quality" />
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Warranty</label>
                  <select
                    name="warranty"
                    value={form.warranty}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                  >
                    <option value="">Select Warranty</option>
                    {warranties.map(w => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                  <Tooltip id="warranty-input" place="top-start" className="hidden sm:block" data-tooltip-content="Select warranty" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <Tooltip id="category-input" place="top-start" className="hidden sm:block" data-tooltip-content="Select category" />
                </div>
              </form>
              <div className="absolute bottom-0 left-0 w-full bg-white/90 dark:bg-gray-900/90 border-t border-gray-200/50 dark:border-gray-700/50 flex justify-end gap-3 px-4 sm:px-6 py-4 rounded-b-3xl shadow-lg">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-3 text-sm sm:text-base rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-100 font-semibold transition-transform duration-200 hover:scale-105"
                  data-tooltip-id="cancel-button"
                  data-tooltip-content="Cancel changes"
                >
                  Cancel
                </button>
                <Tooltip id="cancel-button" place="top-start" className="hidden sm:block" />
                <button
                  type="submit"
                  form="accessory-form"
                  className="px-5 py-3 text-sm sm:text-base rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-transform duration-200 hover:scale-105 flex items-center gap-2 min-w-[120px]"
                  disabled={loading}
                  data-tooltip-id="save-button"
                  data-tooltip-content={editMode ? 'Update accessory' : 'Add accessory'}
                >
                  {loading ? (
                    <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24" aria-label="Loading">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <Plus className="w-6 h-6" />
                  )}
                  {editMode ? 'Update' : 'Add'}
                </button>
                <Tooltip id="save-button" place="top-start" className="hidden sm:block" />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="mb-12">
        <h4 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">All Accessories</h4>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredAccessories.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {filteredAccessories.map(acc => (
              <div
                key={acc.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col gap-2 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-200 sm:hover:scale-[1.02]"
                role="button"
                tabIndex={0}
                aria-label={`View accessory ${acc.name}`}
                data-tooltip-id={`accessory-${acc.id}`}
                data-tooltip-content="Accessory details"
              >
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 truncate">{acc.name}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpen(acc)}
                      className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Edit accessory"
                      data-tooltip-id={`edit-${acc.id}`}
                      data-tooltip-content="Edit accessory"
                    >
                      <Pencil className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </button>
                    <Tooltip id={`edit-${acc.id}`} place="top-start" className="hidden sm:block" />
                    <button
                      onClick={() => handleDelete(acc.id)}
                      className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label="Delete accessory"
                      data-tooltip-id={`delete-${acc.id}`}
                      data-tooltip-content="Delete accessory"
                    >
                      <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </button>
                    <Tooltip id={`delete-${acc.id}`} place="top-start" className="hidden sm:block" />
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  Type: <span className="font-medium text-gray-700 dark:text-gray-100">{acc.type || '-'}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  Company: <span className="font-medium text-gray-700 dark:text-gray-100">{acc.company || '-'}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  Box: <span className="font-medium text-gray-700 dark:text-gray-100">{boxes.find(b => b.id === acc.box_id)?.name || '-'}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  Price: <span className="font-medium text-gray-700 dark:text-gray-100">₹{acc.price}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  Quality: <span className="font-medium text-gray-700 dark:text-gray-100">{acc.quality}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  Warranty: <span className="font-medium text-gray-700 dark:text-gray-100">{acc.warranty}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  Quantity: <span className="font-medium text-gray-700 dark:text-gray-100">{acc.quantity}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  Category: <span className="font-medium text-gray-700 dark:text-gray-100">{acc.category}</span>
                </div>
                <Tooltip id={`accessory-${acc.id}`} place="top-start" className="hidden sm:block" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Accessories;