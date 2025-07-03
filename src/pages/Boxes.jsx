import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import html2canvas from 'html2canvas';

// Environment variable for API URL
const API = 'https://techclinic-api.techclinic-api.workers.dev/api/boxes';

const defaultBox = { id: '', name: '', location: '', company: '', parts_type: '' };
const companies = ['Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Other'];
const partsTypes = ['Display', 'Battery', 'Speaker', 'Charger', 'Other'];

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

function IconExport() {
  return (
    <svg className="w-5 h-5 text-green-600 hover:text-green-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m8-8l-8 8-8-8m16 4H4" />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-xl shadow p-4 flex flex-col gap-2 min-h-[120px]">
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-3 bg-gray-200 rounded w-1/4" />
      <div className="h-3 bg-gray-200 rounded w-1/4" />
      <div className="flex gap-2 mt-2">
        <div className="h-8 w-16 bg-gray-200 rounded" />
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2z" />
      </svg>
      <div className="text-lg font-semibold">No boxes found</div>
      <div className="text-sm">Start by adding a new box.</div>
    </div>
  );
}

function ConfirmDeletePopup({ isOpen, onClose, onConfirm, boxName }) {
  const popupRef = useRef(null);

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
          Are you sure you want to delete the box <span className="font-medium">"{boxName}"</span>?
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

function Sticker({ box, stickerRef }) {
  return (
    <div
      ref={stickerRef}
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #d1d5db',
        padding: '10px', // Reduced padding for more content space
        width: '200px',
        height: '100px',
        fontSize: '9px',
        lineHeight: '1.2',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '6px',
      }}
    >
      <div
        style={{
          fontWeight: 'bold',
          color: '#1e40af',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          fontSize: '10px',
          
        }}
      >
        {box.name}
      </div>
      <div style={{ color: '#4b5563' }}>
        ID: <span style={{ color: '#1f2937' }}>{box.id}</span>
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
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(defaultBox);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: '' });
  const { enqueueSnackbar } = useSnackbar();
  const token = localStorage.getItem('token');
  const [isClosing, setIsClosing] = useState(false);
  const [isContentClosing, setIsContentClosing] = useState(false);
  const drawerRef = useRef(null);
  const stickerRefs = useRef({});

  const fetchBoxes = async () => {
    if (!token) {
      enqueueSnackbar('Please log in to view boxes', { variant: 'error' });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBoxes(res.data);
    } catch (e) {
      enqueueSnackbar('Failed to load boxes', { variant: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBoxes();
  }, []);

  const handleExport = async (box) => {
  const stickerElement = stickerRefs.current[box.id];
  if (!stickerElement) {
    console.error('Sticker element not found for box ID:', box.id);
    enqueueSnackbar('Sticker element not found', { variant: 'error' });
    return;
  }
  try {
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.appendChild(stickerElement);
    document.body.appendChild(tempContainer);

    stickerElement.style.display = 'block';
    await new Promise(resolve => setTimeout(resolve, 100));
    const canvas = await html2canvas(stickerElement, {
      scale: 4,
      backgroundColor: null,
      logging: true,
      imageSmoothingEnabled: true,
    });
    console.log('Sticker rendered for box:', box.name, { width: canvas.width, height: canvas.height });
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `box_${box.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.png`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    enqueueSnackbar(`Box "${box.name}" exported as sticker`, { variant: 'success' });
  } catch (e) {
    console.error('Export error for box ID:', box.id, e);
    enqueueSnackbar(`Failed to export sticker for "${box.name}": ${e.message}`, { variant: 'error' });
  } finally {
    stickerElement.style.display = 'none';
    if (stickerElement.parentNode) {
      stickerElement.parentNode.removeChild(stickerElement);
    }
    document.body.removeChild(tempContainer);
  }
};

  const handleOpen = (box = defaultBox) => {
    setForm(box);
    setEditMode(!!box.id);
    setOpen(true);
    setIsClosing(false);
    setIsContentClosing(false);
  };

  const handleClose = () => {
    setIsContentClosing(true);
    setIsClosing(true);
  };

  useEffect(() => {
    if (isClosing && drawerRef.current) {
      const handleTransitionEnd = () => {
        setOpen(false);
        setIsClosing(false);
        setIsContentClosing(false);
        setForm(defaultBox);
      };
      drawerRef.current.addEventListener('transitionend', handleTransitionEnd);
      return () => drawerRef.current?.removeEventListener('transitionend', handleTransitionEnd);
    }
  }, [isClosing]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      enqueueSnackbar('Name is required', { variant: 'warning' });
      return;
    }
    if (!form.company || !form.parts_type) {
      enqueueSnackbar('Company and Parts Type are required', { variant: 'warning' });
      return;
    }
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
      enqueueSnackbar('Box deleted', { variant: 'success' });
      fetchBoxes();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.error || 'Error deleting box', { variant: 'error' });
    }
    setDeleteConfirm({ isOpen: false, id: null, name: '' });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ isOpen: false, id: null, name: '' });
  };

  return (
    <div className="max-w-5xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-8">
        <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 tracking-tight">Boxes</h2>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 text-white font-semibold px-6 py-2 rounded-xl shadow-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={() => handleOpen()}
          >
            <IconAdd /> Add Box
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
      ) : boxes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {boxes.map(box => (
            <div
              key={box.id}
              className="bg-white/90 dark:bg-[#23263a]/90 rounded-xl shadow-lg p-6 flex flex-col gap-2 transition hover:shadow-2xl group border border-blue-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-400"
            >
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-blue-700 dark:text-blue-300 group-hover:text-purple-600 transition">{box.name}</div>
                <div className="flex gap-1">
                  <button
                    title="Edit"
                    aria-label="Edit box"
                    onClick={() => handleOpen(box)}
                    className="p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <IconEdit />
                  </button>
                  <button
                    title="Delete"
                    aria-label="Delete box"
                    onClick={() => handleDelete(box.id, box.name)}
                    className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <IconDelete />
                  </button>
                  <button
                    title="Export as Sticker"
                    aria-label={`Export box ${box.name} as sticker`}
                    onClick={() => handleExport(box)}
                    className="p-1 rounded hover:bg-green-50 dark:hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    <IconExport />
                  </button>
                </div>
              </div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">
                ID: <span className="font-medium text-gray-700 dark:text-gray-100">{box.id}</span>
              </div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">
                Location: <span className="font-medium text-gray-700 dark:text-gray-100">{box.location || '-'}</span>
              </div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">
                Company: <span className="font-medium text-gray-700 dark:text-gray-100">{box.company || '-'}</span>
              </div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">
                Parts Type: <span className="font-medium text-gray-700 dark:text-gray-100">{box.parts_type || '-'}</span>
              </div>
              {/* Hidden sticker for export */}
              <div style={{ position: 'absolute', left: '-9999px', display: 'none' }}>
                <Sticker box={box} stickerRef={el => (stickerRefs.current[box.id] = el)} />
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Drawer Modal */}
      {open && (
        <div
          className={`fixed inset-0 z-40 flex items-end sm:items-center justify-end transition-opacity duration-300 ${
            open && !isClosing ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
            tabIndex={-1}
            aria-label="Close drawer"
          />
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
                {editMode ? 'Edit Box' : 'Add Box'}
              </h3>
              <div className="border-b border-blue-100 dark:border-gray-800 mb-4 mx-6" />
              <form id="box-form" onSubmit={handleSubmit} className="space-y-4 px-6 pb-24 flex-1 overflow-y-auto">
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
                  <label className="block text-gray-700 mb-1 font-medium">Location</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                  />
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
                    {companies.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">Parts Type</label>
                  <select
                    name="parts_type"
                    value={form.parts_type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                  >
                    <option value="">Select a parts type</option>
                    {partsTypes.map(pt => (
                      <option key={pt} value={pt}>
                        {pt}
                      </option>
                    ))}
                  </select>
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
                  form="box-form"
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
        boxName={deleteConfirm.name}
      />
    </div>
  );
}