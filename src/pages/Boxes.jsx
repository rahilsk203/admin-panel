import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { Tooltip } from 'react-tooltip';
import { Pencil, Trash2, Plus, X, Package2, Search, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

const API = 'https://techclinic-api.techclinic-api.workers.dev/api/boxes';

const defaultBox = { id: '', name: '', location: '', company: '', parts_type: '' };
const companies = ['Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Other'];
const partsTypes = ['Display', 'Battery', 'Speaker', 'Charger', 'Other'];

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
      <div className="text-xl font-semibold">No boxes found</div>
      <div className="text-sm mt-1">Start by adding a new box.</div>
    </div>
  );
}

function ConfirmDeletePopup({ isOpen, onClose, onConfirm, boxName }) {
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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        ref={popupRef}
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-sm transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'scale-100' : 'scale-95'
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Confirm Delete</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to delete the box <span className="font-medium">"{boxName}"</span>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-3 text-sm sm:text-base rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-100 font-semibold transition-transform duration-200 hover:scale-105"
            data-tooltip-id="cancel-delete"
            data-tooltip-content="Cancel deletion"
          >
            Cancel
          </button>
          <Tooltip id="cancel-delete" place="top-start" className="hidden sm:block" />
          <button
            onClick={onConfirm}
            className="px-5 py-3 text-sm sm:text-base rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-transform duration-200 hover:scale-105"
            data-tooltip-id="confirm-delete"
            data-tooltip-content="Confirm deletion"
          >
            Delete
          </button>
          <Tooltip id="confirm-delete" place="top-start" className="hidden sm:block" />
        </div>
      </div>
    </div>
  );
}

function Sticker({ box, stickerRef }) {
  return (
    <div
      ref={stickerRef}
      style={{
        display: 'block',
        width: '200px',
        height: '100px',
        backgroundColor: '#ffffff',
        border: '1px solid #d1d5db',
        borderRadius: '0.75rem',
        padding: '12px',
        fontSize: '9px',
        lineHeight: '1.2',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          fontWeight: 'bold',
          color: '#1e40af', // Tailwind's text-blue-700
          fontSize: '10px',
          overflowWrap: 'break-word',
        }}
      >
        {box.name || 'Unnamed Box'}
      </div>
      <div style={{ color: '#4b5563' /* Tailwind's text-gray-600 */ }}>
        ID: <span style={{ color: '#1f2937' /* text-gray-800 */ }}>{box.id || '-'}</span>
      </div>
      <div style={{ color: '#4b5563' }}>
        Location: <span style={{ color: '#1f2937' }}>{box.location || '-'}</span>
      </div>
      <div style={{ color: '#4b5563' }}>
        Company: <span style={{ color: '#1f2937' }}>{box.company || '-'}</span>
      </div>
      <div style={{ color: '#4b5563' }}>
        Parts Type: <span style={{ color: '#1f2937' }}>{box.parts_type || '-'}</span>
      </div>
    </div>
  );
}

export default function Boxes() {
  const [boxes, setBoxes] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(defaultBox);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: '' });
  const { enqueueSnackbar } = useSnackbar();
  const token = localStorage.getItem('token');
  const [isClosing, setIsClosing] = useState(false);
  const drawerRef = useRef();
  const stickerRefs = useRef({});

  const fetchBoxes = async () => {
    if (!token) {
      enqueueSnackbar('Please log in to view boxes', { variant: 'error' });
      setInitialLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBoxes(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      enqueueSnackbar('Failed to load boxes', { variant: 'error' });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchBoxes();
  }, []);

  const handleExport = async (box) => {
    const stickerElement = stickerRefs.current[box.id];
    if (!stickerElement) {
      enqueueSnackbar('Sticker element not found for box', { variant: 'error' });
      console.error('Sticker element not found for box ID:', box.id);
      return;
    }
    setLoading(true);
    try {
      // Create a temporary container
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '200px';
      tempContainer.style.height = '100px';

      // Clone the sticker element and ensure it's visible
      const clonedSticker = stickerElement.cloneNode(true);
      clonedSticker.style.display = 'block';
      tempContainer.appendChild(clonedSticker);
      document.body.appendChild(tempContainer);

      // Wait for rendering
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Use html2canvas with optimized settings
      const canvas = await html2canvas(clonedSticker, {
        scale: 4,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        width: 200,
        height: 100,
      });

      // Verify canvas dimensions
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas rendering failed: empty dimensions');
      }

      // Generate download
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `box_${box.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      document.body.removeChild(tempContainer);

      enqueueSnackbar(`Box "${box.name}" exported as sticker`, { variant: 'success' });
    } catch (e) {
      console.error('Export error for box:', box.name, e);
      enqueueSnackbar(`Failed to export sticker for "${box.name}": ${e.message}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (box = defaultBox) => {
    setForm(box);
    setEditMode(!!box.id);
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
        setForm(defaultBox);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isClosing]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return enqueueSnackbar('Name is required', { variant: 'warning' });
    if (form.name.length > 50) return enqueueSnackbar('Name must be 50 characters or less', { variant: 'warning' });
    if (!form.company) return enqueueSnackbar('Company is required', { variant: 'warning' });
    if (!form.parts_type) return enqueueSnackbar('Parts Type is required', { variant: 'warning' });

    setLoading(true);
    try {
      if (editMode) {
        await axios.put(`${API}/${form.id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        enqueueSnackbar('Box updated', { variant: 'success' });
      } else {
        await axios.post(API, { ...form, id: crypto.randomUUID() }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        enqueueSnackbar('Box added', { variant: 'success' });
      }
      handleClose();
      fetchBoxes();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.error || 'Error saving box', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id, name) => {
    setDeleteConfirm({ isOpen: true, id, name });
  };

  const confirmDelete = async () => {
    const { id } = deleteConfirm;
    setLoading(true);
    try {
      await axios.delete(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      enqueueSnackbar('Box deleted', { variant: 'success' });
      fetchBoxes();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.error || 'Error deleting box', { variant: 'error' });
    } finally {
      setLoading(false);
      setDeleteConfirm({ isOpen: false, id: null, name: '' });
    }
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ isOpen: false, id: null, name: '' });
  };

  const filteredBoxes = boxes.filter(
    (box) =>
      box.name?.toLowerCase().includes(search.toLowerCase()) ||
      box.parts_type?.toLowerCase().includes(search.toLowerCase())
  );

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen" aria-label="Loading boxes">
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
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">Boxes</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or parts type"
              className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-tooltip-id="search-input"
              data-tooltip-content="Search boxes"
            />
            <Tooltip id="search-input" place="top-start" className="hidden sm:block" />
          </div>
          <button
            className="px-4 py-2 text-sm sm:text-base rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 transition-transform duration-200 hover:scale-105 w-full sm:w-auto"
            onClick={() => handleOpen()}
            data-tooltip-id="add-box"
            data-tooltip-content="Add a new box"
          >
            <Plus className="w-5 h-5" />
            Add Box
          </button>
          <Tooltip id="add-box" place="top-start" className="hidden sm:block" />
        </div>
      </div>
      <div className="border-b border-gray-200/50 dark:border-gray-700/50 mb-6" />
      <div className="mb-12">
        <h4 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">All Boxes</h4>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(Math.min(6, Math.ceil(window.innerWidth / 300)))].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredBoxes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {filteredBoxes.map((box) => (
              <div
                key={box.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col gap-2 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-200 sm:hover:scale-[1.02]"
                role="button"
                tabIndex={0}
                aria-label={`View box ${box.name}`}
                data-tooltip-id={`box-${box.id}`}
                data-tooltip-content="Box details"
              >
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 truncate">{box.name}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpen(box)}
                      className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Edit box"
                      data-tooltip-id={`edit-${box.id}`}
                      data-tooltip-content="Edit box"
                    >
                      <Pencil className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </button>
                    <Tooltip id={`edit-${box.id}`} place="top-start" className="hidden sm:block" />
                    <button
                      onClick={() => handleDelete(box.id, box.name)}
                      className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label="Delete box"
                      data-tooltip-id={`delete-${box.id}`}
                      data-tooltip-content="Delete box"
                    >
                      <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </button>
                    <Tooltip id={`delete-${box.id}`} place="top-start" className="hidden sm:block" />
                    <button
                      onClick={() => handleExport(box)}
                      className="p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                      aria-label={`Export box ${box.name} as sticker`}
                      data-tooltip-id={`export-${box.id}`}
                      data-tooltip-content="Export as sticker"
                    >
                      <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </button>
                    <Tooltip id={`export-${box.id}`} place="top-start" className="hidden sm:block" />
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  ID: <span className="font-medium text-gray-700 dark:text-gray-100">{box.id}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  Location: <span className="font-medium text-gray-700 dark:text-gray-100">{box.location || '-'}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  Company: <span className="font-medium text-gray-700 dark:text-gray-100">{box.company || '-'}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  Parts Type: <span className="font-medium text-gray-700 dark:text-gray-100">{box.parts_type || '-'}</span>
                </div>
                <div style={{ position: 'absolute', left: '-9999px', display: 'none' }}>
                  <Sticker box={box} stickerRef={(el) => (stickerRefs.current[box.id] = el)} />
                </div>
                <Tooltip id={`box-${box.id}`} place="top-start" className="hidden sm:block" />
              </div>
            ))}
          </div>
        )}
      </div>
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
            role="dialog"
            aria-labelledby="drawer-title"
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
              <h3 id="drawer-title" className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2 text-center tracking-tight px-4 sm:px-6 pt-10">
                {editMode ? 'Edit Box' : 'Add Box'}
              </h3>
              <div className="border-b border-gray-200/50 dark:border-gray-700/50 mb-6 mx-4 sm:mx-6" />
              <form id="box-form" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-6 pb-24 flex-1 overflow-y-auto">
                <div className="sm:col-span-2">
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    maxLength={50}
                    className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                    data-tooltip-id="name-input"
                    data-tooltip-content="Enter box name"
                  />
                  <Tooltip id="name-input" place="top-start" className="hidden sm:block" />
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                    data-tooltip-id="location-input"
                    data-tooltip-content="Enter box location"
                  />
                  <Tooltip id="location-input" place="top-start" className="hidden sm:block" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Company</label>
                  <select
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                  >
                    <option value="">Select Company</option>
                    {companies.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <Tooltip id="company-input" place="top-start" className="hidden sm:block" data-tooltip-content="Select company" />
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Parts Type</label>
                  <select
                    name="parts_type"
                    value={form.parts_type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                  >
                    <option value="">Select Parts Type</option>
                    {partsTypes.map((pt) => (
                      <option key={pt} value={pt}>
                        {pt}
                      </option>
                    ))}
                  </select>
                  <Tooltip id="parts-type-input" place="top-start" className="hidden sm:block" data-tooltip-content="Select parts type" />
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
                  form="box-form"
                  className="px-5 py-3 text-sm sm:text-base rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-transform duration-200 hover:scale-105 flex items-center gap-2 min-w-[120px]"
                  disabled={loading}
                  data-tooltip-id="save-button"
                  data-tooltip-content={editMode ? 'Update box' : 'Add box'}
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
      <ConfirmDeletePopup
        isOpen={deleteConfirm.isOpen}
        onClose={closeDeleteConfirm}
        onConfirm={confirmDelete}
        boxName={deleteConfirm.name}
      />
    </div>
  );
}