import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const API = 'https://techclinic-api.techclinic-api.workers.dev/api/parts';
const BOXES_API = 'https://techclinic-api.techclinic-api.workers.dev/api/boxes';

const defaultPart = {
  id: '',
  name: '',
  type: '',
  custom_type: '',
  company: '',
  custom_company: '',
  box_id: '',
  quantity: 1,
  repairing_cost: 0,
  selling_cost: 0,
  repairing_parts: '',
};
const types = ['Display', 'Battery', 'Speaker', 'Motherboard', 'Camera', 'Other'];
const companies = ['Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Other'];
const repairingParts = ['Repair', 'Replacement'];

function IconEdit() {
  return (
    <svg className="w-5 h-5 text-blue-600 hover:text-blue-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h2v2H7v-2h2zm0 0v-2h2v2H9z" />
    </svg>
  );
}

function IconDelete() {
  return (
    <svg className="w-5 h-5 text-red-600 hover:text-red-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconAdd() {
  return (
    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
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
      <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 21m6-4l.75 4M9 21h6M4.5 10.5l15 0M4.5 10.5l1.5-6h12l1.5 6" />
      </svg>
      <div className="text-lg font-semibold">No parts found</div>
      <div className="text-sm">Start by adding a new part.</div>
    </div>
  );
}

function ConfirmDeletePopup({ isOpen, onClose, onConfirm, partName }) {
  const popupRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        ref={popupRef}
        className={`bg-white dark:bg-[#23263a] rounded-xl shadow-2xl p-6 w-full max-w-sm transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'scale-100' : 'scale-95'
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Confirm Delete</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to delete the part <span className="font-medium">"{partName}"</span>?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-100 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Parts() {
  const [parts, setParts] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(defaultPart);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: '' });
  const { enqueueSnackbar } = useSnackbar();
  const token = localStorage.getItem('token');
  const [isClosing, setIsClosing] = useState(false);
  const [isContentClosing, setIsClosingContent] = useState(false);
  const drawerRef = useRef();

  const fetchParts = async () => {
    if (!token) {
      enqueueSnackbar('Please log in to view parts', { variant: 'error' });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
      });
      setBoxes(res.data);
    } catch (e) {
      enqueueSnackbar('Failed to load boxes', { variant: 'error' });
    }
  };

  useEffect(() => {
    fetchParts();
    fetchBoxes();
  }, []);

  const handleOpen = (part = defaultPart) => {
    setForm(part);
    setEditMode(!!part.id);
    setOpen(true);
    setIsClosing(false);
    setIsClosingContent(false);
  };

  const handleClose = () => {
    setIsClosingContent(true);
    setIsClosing(true);
  };

  useEffect(() => {
    if (isClosing && drawerRef.current) {
      const handleTransitionEnd = () => {
        setOpen(false);
        setIsClosing(false);
        setIsClosingContent(false);
        setForm(defaultPart);
      };
      drawerRef.current.addEventListener('transitionend', handleTransitionEnd);
      return () => drawerRef.current?.removeEventListener('transitionend', handleTransitionEnd);
    }
  }, [isClosing]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return enqueueSnackbar('Name is required', { variant: 'warning' });
    if (form.name.length > 50) return enqueueSnackbar('Name must be 50 characters or less', { variant: 'warning' });
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
          headers: { Authorization: `Bearer ${token}` },
        });
        enqueueSnackbar('Part updated', { variant: 'success' });
      } else {
        await axios.post(API, { ...payload, id: crypto.randomUUID() }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        enqueueSnackbar('Part added', { variant: 'success' });
      }
      handleClose();
      fetchParts();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.error || 'Error saving part', { variant: 'error' });
    }
  };

  const handleDelete = (id, name) => {
    setDeleteConfirm({ isOpen: true, id, name });
  };

  const confirmDelete = async () => {
    const { id } = deleteConfirm;
    try {
      await axios.delete(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      enqueueSnackbar('Part deleted', { variant: 'success' });
      fetchParts();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.error || 'Error deleting part', { variant: 'error' });
    }
    setDeleteConfirm({ isOpen: false, id: null, name: '' });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ isOpen: false, id: null, name: '' });
  };

  return (
    <div className="max-w-5xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-8">
        <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 tracking-tight">Parts</h2>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 text-white font-semibold px-4 py-2 sm:px-6 sm:py-2 rounded-xl shadow-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400 w-30px sm:w-auto"
            onClick={() => handleOpen()}
          >
            <IconAdd /> Add Part
          </button>
        </div>
      </div>
      <div className="border-b border-blue-100 dark:border-gray-800 mb-6" />
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(Math.min(6, Math.ceil(window.innerWidth / 300)))].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : parts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {parts.map((part) => (
            <div
              key={part.id}
              className="bg-white/90 dark:bg-[#23263a]/90 rounded-xl shadow-lg p-6 flex flex-col gap-2 transition hover:shadow-2xl group border border-blue-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-400"
            >
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-blue-700 dark:text-blue-300 group-hover:text-purple-600 transition">{part.name}</div>
                <div className="flex gap-1">
                  <button
                    title="Edit"
                    aria-label="Edit part"
                    onClick={() => handleOpen(part)}
                    className="p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <IconEdit />
                  </button>
                  <button
                    title="Delete"
                    aria-label="Delete part"
                    onClick={() => handleDelete(part.id, part.name)}
                    className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <IconDelete />
                  </button>
                </div>
              </div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">
                Type: <span className="font-medium text-gray-700 dark:text-gray-100">{part.type || '-'}</span>
              </div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">
                Company: <span className="font-medium text-gray-700 dark:text-gray-100">{part.company || '-'}</span>
              </div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">
                Box: <span className="font-medium text-gray-700 dark:text-gray-100">{boxes.find((b) => b.id === part.box_id)?.name || '-'}</span>
              </div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">
                Quantity: <span className="font-medium text-gray-700 dark:text-gray-100">{part.quantity}</span>
              </div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">
                Repairing Cost: <span className="font-medium text-gray-700 dark:text-gray-100">₹{part.repairing_cost}</span>
              </div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">
                Selling Cost: <span className="font-medium text-gray-700 dark:text-gray-100">₹{part.selling_cost}</span>
              </div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">
                Repairing Parts: <span className="font-medium text-gray-700 dark:text-gray-100">{part.repairing_parts || '-'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {open && (
        <div
          className={`fixed inset-0 z-40 flex items-end sm:items-center justify-end transition-opacity duration-300 ${
            open && !isClosing ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} tabIndex={-1} aria-label="Close drawer" />
          <div
            ref={drawerRef}
            role="dialog"
            aria-labelledby="drawer-title"
            className={`relative w-full sm:w-[440px] h-full bg-white/95 dark:bg-[#23263a]/95 shadow-2xl border-l border-blue-100 dark:border-gray-800 flex flex-col max-w-full rounded-l-2xl sm:rounded-l-3xl transition-transform duration-300 ease-in-out ${
              isClosing ? 'translate-x-full' : 'translate-x-0'
            }`}
            style={{ boxShadow: '0 8px 32px 0 rgba(60,60,120,0.18), 0 1.5px 8px 0 rgba(60,60,120,0.10)' }}
          >
            <div
              className={`flex-1 flex flex-col h-full transition-all duration-300 ease-in-out ${
                isContentClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-full p-2 bg-white/80 dark:bg-[#23263a]/80 z-10"
                aria-label="Close drawer"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 id="drawer-title" className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-2 text-center tracking-tight px-6 pt-10">
                {editMode ? 'Edit Part' : 'Add Part'}
              </h3>
              <div className="border-b border-blue-100 dark:border-gray-800 mb-4 mx-6" />
              <form id="part-form" onSubmit={handleSubmit} className="space-y-4 px-6 pb-24 flex-1 overflow-y-auto">
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    maxLength={50}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70 dark:bg-[#23263a]/80 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">Type</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                  >
                    <option value="">Select a type</option>
                    {types.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {form.type === 'Other' && (
                    <input
                      name="custom_type"
                      value={form.custom_type}
                      onChange={handleChange}
                      placeholder="Custom type"
                      required
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
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                  >
                    <option value="">Select a company</option>
                    {companies.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {form.company === 'Other' && (
                    <input
                      name="custom_company"
                      value={form.custom_company}
                      onChange={handleChange}
                      placeholder="Custom company"
                      required
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
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                  >
                    <option value="">Select a box</option>
                    {boxes.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">Quantity</label>
                    <input
                      name="quantity"
                      type="number"
                      min="1"
                      step="1"
                      value={form.quantity}
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
                      <option value="">Select repairing parts</option>
                      {repairingParts.map((rp) => (
                        <option key={rp} value={rp}>
                          {rp}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">Repairing Cost (₹)</label>
                    <input
                      name="repairing_cost"
                      type="number"
                      min="0"
                      step="1"
                      value={form.repairing_cost}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">Selling Cost (₹)</label>
                    <input
                      name="selling_cost"
                      type="number"
                      min="0"
                      step="1"
                      value={form.selling_cost}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                    />
                  </div>
                </div>
                <div className="h-24 sm:hidden" />
              </form>
              <div className="absolute bottom-0 left-0 w-full bg-white/95 dark:bg-[#23263a]/95 border-t border-blue-100 dark:border-gray-800 flex justify-end gap-2 px-6 py-4 z-50 rounded-b-2xl shadow-lg">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-100 font-semibold shadow"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="part-form"
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
                >
                  {editMode ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmDeletePopup
        isOpen={deleteConfirm.isOpen}
        onClose={closeDeleteConfirm}
        onConfirm={confirmDelete}
        partName={deleteConfirm.name}
      />
    </div>
  );
}