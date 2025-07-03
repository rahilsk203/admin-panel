import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { Tooltip } from 'react-tooltip';
import { X, Plus, Search, Save, Package } from 'lucide-react';

// Fallback data
const fallbackCustomers = [
  { id: '1', name: 'John Doe', mobile_number: '1234567890' },
  { id: '2', name: 'Jane Smith', mobile_number: '0987654321' },
];
const fallbackJobs = [
  { id: '1', customer_id: '1', status: 'In Progress', notes: 'Test note', created_at: '2025-07-03T10:00:00Z' },
  { id: '2', customer_id: '2', status: 'Completed', notes: 'Done', created_at: '2025-07-02T12:00:00Z' },
];
const fallbackParts = [
  { id: 'P001', name: 'Battery' },
  { id: 'P002', name: 'Screen' },
  { id: 'P003', name: 'Motherboard' },
];
const fallbackBoxes = [
  {
    id: 'B001',
    name: 'Storage Box A',
    quantity: 50,
    parts: [
      { part_id: 'P001', quantity: 20 },
      { part_id: 'P002', quantity: 30 },
      { part_id: 'P003', quantity: 0 }, // Zero quantity, won't appear in dropdown
    ],
  },
  {
    id: 'B002',
    name: 'Storage Box B',
    quantity: 30,
    parts: [
      { part_id: 'P002', quantity: 10 },
      { part_id: 'P003', quantity: 20 },
    ],
  },
  {
    id: 'B003',
    name: 'Storage Box C',
    quantity: 75,
    parts: [
      { part_id: 'P001', quantity: 25 },
      { part_id: 'P003', quantity: 50 },
      { part_id: 'P002', quantity: 0 }, // Zero quantity, won't appear in dropdown
    ],
  },
];

// Debounce function for search input
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// SkeletonCard (unchanged)
function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col gap-3">
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3" />
    </div>
  );
}

// EmptyState (unchanged)
function EmptyState({ text = 'No data found', sub = '' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
      <Package className="w-20 h-20 mb-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
      <div className="text-xl font-semibold">{text}</div>
      {sub && <div className="text-sm mt-1">{sub}</div>}
    </div>
  );
}

// RepairJobDrawer (unchanged)
function RepairJobDrawer({ open, onClose, onSave, form, setForm, loading, customers, editMode }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-end transition-all duration-300 ${
        open ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        role="button"
        aria-label="Close drawer"
        tabIndex={-1}
      />
      <div
        className={`relative w-full h-full sm:w-[400px] sm:max-w-[90vw] bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-2xl border-l border-gray-200/50 dark:border-gray-700/50 flex flex-col rounded-l-3xl sm:rounded-t-none transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex-1 flex flex-col h-full max-h-[calc(100vh-80px)]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-transform duration-200 hover:scale-110 rounded-full p-3 bg-white/50 dark:bg-gray-800/50"
            aria-label="Close drawer"
            data-tooltip-id="close-drawer"
            data-tooltip-content="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <Tooltip id="close-drawer" place="top-start" className="hidden sm:block" />
          <h3 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2 text-center tracking-tight px-4 sm:px-6 pt-10">
            {editMode ? 'Edit Repair Job' : 'Add Repair Job'}
          </h3>
          <div className="border-b border-gray-200/50 dark:border-gray-700/50 mb-6 mx-4 sm:mx-6" />
          <form id="repairjob-form" onSubmit={onSave} className="space-y-6 px-4 sm:px-6 pb-24 flex-1 overflow-y-auto">
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Customer</label>
              <select
                name="customer_id"
                required
                className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                value={form.customer_id || ''}
                onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}
                disabled={editMode}
                data-tooltip-id="customer-select"
                data-tooltip-content="Select a customer for the repair job"
              >
                <option value="">Select a customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.mobile_number})
                  </option>
                ))}
              </select>
              <Tooltip id="customer-select" place="top-start" className="hidden sm:block" />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select
                name="status"
                required
                className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                value={form.status || ''}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                data-tooltip-id="status-input"
                data-tooltip-content="Select the current status of the repair job"
              >
                <option value="">Select status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <Tooltip id="status-input" place="top-start" className="hidden sm:block" />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
              <textarea
                name="notes"
                className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                value={form.notes || ''}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Add any relevant notes"
                rows={4}
                data-tooltip-id="notes-input"
                data-tooltip-content="Optional notes for the repair job"
              />
              <Tooltip id="notes-input" place="top-start" className="hidden sm:block" />
            </div>
          </form>
          <div className="absolute bottom-0 left-0 w-full bg-white/90 dark:bg-gray-900/90 border-t border-gray-200/50 dark:border-gray-700/50 flex justify-end gap-3 px-4 sm:px-6 py-4 rounded-b-3xl shadow-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 text-sm sm:text-base rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-100 font-semibold transition-transform duration-200 hover:scale-105"
              data-tooltip-id="cancel-button"
              data-tooltip-content="Cancel changes"
            >
              Cancel
            </button>
            <Tooltip id="cancel-button" place="top-start" className="hidden sm:block" />
            <button
              type="submit"
              form="repairjob-form"
              className="px-5 py-3 text-sm sm:text-base rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-transform duration-200 hover:scale-105 flex items-center gap-2 min-w-[120px]"
              disabled={loading}
              data-tooltip-id="save-button"
              data-tooltip-content={editMode ? 'Update repair job' : 'Save new repair job'}
            >
              {loading ? (
                <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <Save className="w-6 h-6" />
              )}
              {editMode ? 'Update' : 'Save'}
            </button>
            <Tooltip id="save-button" place="top-start" className="hidden sm:block" />
          </div>
        </div>
      </div>
    </div>
  );
}

// JobDetailsDrawer (updated to filter parts by quantity > 0 and limit quantity input)
function JobDetailsDrawer({ open, onClose, job, customers, partsUsed, partLoading, onEdit, onAssignPart, partForm, setPartForm, partLoadingState, parts, boxes }) {
  const { enqueueSnackbar } = useSnackbar();
  const [availableParts, setAvailableParts] = useState([]);

  // Fetch parts for the selected box
  useEffect(() => {
    if (!partForm.box_id) {
      setAvailableParts([]);
      return;
    }
    const fetchPartsForBox = async () => {
      const token = localStorage.getItem('token');
      const selectedBox = boxes.find(b => b.id === partForm.box_id);
      if (!selectedBox) {
        setAvailableParts([]);
        return;
      }
      try {
        const res = await fetch(`https://techclinic-api.techclinic-api.workers.dev/api/boxes/${partForm.box_id}/parts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch parts for box');
        // Filter parts with quantity > 0
        setAvailableParts(data.filter(p => p.quantity > 0) || selectedBox.parts.filter(p => p.quantity > 0) || []);
      } catch (err) {
        console.error('Fetch parts for box error:', err);
        enqueueSnackbar('Failed to fetch parts for box. Using fallback data.', { variant: 'error' });
        setAvailableParts(selectedBox.parts?.filter(p => p.quantity > 0) || []);
      }
    };
    fetchPartsForBox();
  }, [partForm.box_id, boxes, enqueueSnackbar]);

  // Reset part_id and quantity when box_id changes
  useEffect(() => {
    setPartForm(prev => ({ ...prev, part_id: '', quantity: 1 }));
  }, [partForm.box_id, setPartForm]);

  // Get max quantity for the selected part
  const maxQuantity = useMemo(() => {
    if (!partForm.box_id || !partForm.part_id) return 1;
    const selectedBox = boxes.find(b => b.id === partForm.box_id);
    const selectedPart = selectedBox?.parts?.find(p => p.part_id === partForm.part_id);
    return selectedPart?.quantity || 1;
  }, [partForm.box_id, partForm.part_id, boxes]);

  const getCustomerName = (id) => {
    const c = customers.find(c => c.id === id);
    return c ? `${c.name} (${c.mobile_number})` : id || 'Unknown';
  };

  const getStatusColor = (status) => {
    if (!status || typeof status !== 'string') return 'bg-gray-200 text-gray-500';
    switch (status.toLowerCase()) {
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-200 text-gray-500';
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-end transition-all duration-300 ${
        open ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
        role="button"
        aria-label="Close drawer"
        tabIndex={-1}
      />
      <div
        className={`relative w-full h-full sm:w-[400px] sm:max-w-[90vw] bg-gradient-to-b from-white/90 to-gray-100/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-md shadow-xl border-l border-gray-200/50 dark:border-gray-700/50 flex flex-col rounded-l-3xl sm:rounded-t-none transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex-1 flex flex-col h-full max-h-[calc(100vh-80px)] p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl sm:text-3xl font-bold text-blue-700 dark:text-blue-300 tracking-tight">
              Repair Job Details
            </h3>
            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-transform duration-200 hover:scale-110 rounded-full p-3 bg-white/50 dark:bg-gray-800/50"
                aria-label="Edit repair job"
                data-tooltip-id="edit-details-drawer"
                data-tooltip-content="Edit this job"
              >
                <Save className="w-6 h-6" />
              </button>
              <button
                onClick={onClose}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-transform duration-200 hover:scale-110 rounded-full p-3 bg-white/50 dark:bg-gray-800/50"
                aria-label="Close drawer"
                data-tooltip-id="close-details-drawer"
                data-tooltip-content="Close"
              >
                <X className="w-6 h-6" />
              </button>
              <Tooltip id="edit-details-drawer" place="top-start" className="hidden sm:block" />
              <Tooltip id="close-details-drawer" place="top-start" className="hidden sm:block" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-6">
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1">Job ID</label>
              <div className="text-gray-900 dark:text-gray-100 text-base sm:text-lg">{job?.id || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label>
              <div className="text-gray-900 dark:text-gray-100 text-base sm:text-lg">{getCustomerName(job?.customer_id)}</div>
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <span className={`text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full ${getStatusColor(job?.status)}`}>
                {job?.status || 'N/A'}
              </span>
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <div className="text-gray-900 dark:text-gray-100 text-base sm:text-lg">{job?.notes || 'No notes'}</div>
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1">Created</label>
              <div className="text-gray-900 dark:text-gray-100 text-base sm:text-lg">
                {job?.created_at
                  ? new Date(job.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                  : 'N/A'}
              </div>
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1">Parts Used</label>
              {partLoading ? (
                <SkeletonCard />
              ) : partsUsed.length === 0 ? (
                <EmptyState text="No parts used yet." sub="No parts have been assigned to this job." />
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {partsUsed.map((p) => (
                    <div
                      key={p.id}
                      className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-300 shadow-sm"
                    >
                      <div><span className="font-semibold">Part ID:</span> {p.part_id || 'N/A'}</div>
                      <div><span className="font-semibold">Box ID:</span> {p.box_id || 'N/A'}</div>
                      <div><span className="font-semibold">Quantity:</span> {p.quantity || 'N/A'}</div>
                      <div>
                        <span className="font-semibold">Used At:</span>{' '}
                        {p.used_at
                          ? new Date(p.used_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                          : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">Assign Part</h4>
              <form onSubmit={onAssignPart} className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-4">
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Box</label>
                  <select
                    name="box_id"
                    required
                    className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                    value={partForm.box_id || ''}
                    onChange={e => setPartForm({ ...partForm, box_id: e.target.value })}
                    data-tooltip-id="box-id"
                    data-tooltip-content="Select a box"
                  >
                    <option value="">Select a box</option>
                    {boxes.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.quantity} parts)
                      </option>
                    ))}
                  </select>
                  <Tooltip id="box-id" place="top-start" className="hidden sm:block" />
                </div>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Part</label>
                  <select
                    name="part_id"
                    required
                    className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                    value={partForm.part_id || ''}
                    onChange={e => setPartForm({ ...partForm, part_id: e.target.value, quantity: 1 })}
                    disabled={!partForm.box_id}
                    data-tooltip-id="part-id"
                    data-tooltip-content="Select a part"
                  >
                    <option value="">Select a part</option>
                    {availableParts.map(p => {
                      const part = parts.find(part => part.id === p.part_id);
                      return (
                        <option key={p.part_id} value={p.part_id}>
                          {part ? `${part.name} (${p.quantity} available)` : p.part_id}
                        </option>
                      );
                    })}
                  </select>
                  <Tooltip id="part-id" place="top-start" className="hidden sm:block" />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    max={maxQuantity}
                    className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                    placeholder="Quantity"
                    value={partForm.quantity}
                    onChange={e => {
                      const value = parseInt(e.target.value) || 1;
                      if (value > maxQuantity) {
                        enqueueSnackbar(`Cannot exceed ${maxQuantity} available parts`, { variant: 'warning' });
                        setPartForm({ ...partForm, quantity: maxQuantity });
                      } else {
                        setPartForm({ ...partForm, quantity: value });
                      }
                    }}
                    required
                    aria-label="Quantity"
                    data-tooltip-id="quantity"
                    data-tooltip-content={`Enter quantity (max ${maxQuantity})`}
                  />
                  <button
                    type="submit"
                    className="px-4 py-3 text-sm sm:text-base rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-transform duration-200 hover:scale-105 flex items-center gap-2 min-w-[100px]"
                    disabled={partLoadingState || !job?.id || !partForm.box_id || !partForm.part_id}
                    aria-label="Assign part to job"
                    data-tooltip-id="assign-part"
                    data-tooltip-content="Assign part to job"
                  >
                    {partLoadingState ? (
                      <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : (
                      <Plus className="w-6 h-6" />
                    )}
                    Assign
                  </button>
                  <Tooltip id="quantity" place="top-start" className="hidden sm:block" />
                  <Tooltip id="assign-part" place="top-start" className="hidden sm:block" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main RepairJobs component
export default function RepairJobs() {
  const { enqueueSnackbar } = useSnackbar();
  const [isAddEditDrawerOpen, setIsAddEditDrawerOpen] = useState(false);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ customer_id: '', status: '', notes: '' });
  const [customers, setCustomers] = useState(fallbackCustomers);
  const [parts, setParts] = useState(fallbackParts);
  const [boxes, setBoxes] = useState(fallbackBoxes);
  const [allJobs, setAllJobs] = useState(fallbackJobs);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [partsUsed, setPartsUsed] = useState([]);
  const [partForm, setPartForm] = useState({ part_id: '', box_id: '', quantity: 1 });
  const [partLoading, setPartLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  // Debounced search handler
  const debouncedSetSearchTerm = useCallback(
    debounce((value) => setSearchTerm(value), 300),
    []
  );

  // Fetch customers, parts, and boxes with fallback
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      enqueueSnackbar('Authentication token missing. Using fallback data.', { variant: 'warning' });
      setCustomers(fallbackCustomers);
      setParts(fallbackParts);
      setBoxes(fallbackBoxes);
      setInitialLoading(false);
      return;
    }
    Promise.all([
      fetch('https://techclinic-api.techclinic-api.workers.dev/api/customers', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
      fetch('https://techclinic-api.techclinic-api.workers.dev/api/parts', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
      fetch('https://techclinic-api.techclinic-api.workers.dev/api/boxes', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
    ])
      .then(([customerData, partsData, boxesData]) => {
        setCustomers(Array.isArray(customerData) && customerData.length > 0 ? customerData : fallbackCustomers);
        setParts(Array.isArray(partsData) && partsData.length > 0 ? partsData : fallbackParts);
        setBoxes(Array.isArray(boxesData) && boxesData.length > 0 ? boxesData : fallbackBoxes);
        setInitialLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        enqueueSnackbar('Failed to fetch data. Using fallback data.', { variant: 'error' });
        setCustomers(fallbackCustomers);
        setParts(fallbackParts);
        setBoxes(fallbackBoxes);
        setInitialLoading(false);
      });
  }, [enqueueSnackbar]);

  // Fetch repair jobs with fallback
  useEffect(() => {
    setJobsLoading(true);
    fetch('https://techclinic-api.techclinic-api.workers.dev/api/repair-jobs')
      .then(r => r.json())
      .then(data => {
        setAllJobs(Array.isArray(data) && data.length > 0 ? data : fallbackJobs);
        setJobsLoading(false);
      })
      .catch(err => {
        console.error('Repair jobs fetch error:', err);
        enqueueSnackbar('Failed to fetch repair jobs. Using fallback data.', { variant: 'error' });
        setAllJobs(fallbackJobs);
        setJobsLoading(false);
      });
  }, [isAddEditDrawerOpen, enqueueSnackbar]);

  // Fetch parts used
  const fetchPartsUsed = useCallback(async (jobId) => {
    if (!jobId) {
      setPartsUsed([]);
      return;
    }
    setPartLoading(true);
    try {
      const res = await fetch(`https://techclinic-api.techclinic-api.workers.dev/api/repair-jobs/${jobId}/parts`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch parts used');
      setPartsUsed(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Parts fetch error:', err);
      enqueueSnackbar(err.message, { variant: 'error' });
      setPartsUsed([]);
    } finally {
      setPartLoading(false);
    }
  }, [enqueueSnackbar]);

  // Handle save repair job
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.customer_id || !form.status) {
      enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token missing');
      let res, data;
      if (editMode) {
        res = await fetch(`https://techclinic-api.techclinic-api.workers.dev/api/repair-jobs/${form.id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: form.status, notes: form.notes }),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update job');
        enqueueSnackbar('Repair job updated!', { variant: 'success' });
      } else {
        res = await fetch('https://techclinic-api.techclinic-api.workers.dev/api/repair-jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(form),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create job');
        enqueueSnackbar('Repair job created!', { variant: 'success' });
      }
      setForm({ customer_id: '', status: '', notes: '' });
      setIsAddEditDrawerOpen(false);
      setEditMode(false);
    } catch (err) {
      console.error('Save error:', err);
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle job selection
  const handleSelectJob = useCallback((job) => {
    setSelectedJob(job);
    fetchPartsUsed(job.id);
    setIsDetailsDrawerOpen(true);
  }, [fetchPartsUsed]);

  // Handle assign part
  const handleAssignPart = async (e) => {
    e.preventDefault();
    if (!selectedJob) {
      enqueueSnackbar('No job selected', { variant: 'error' });
      return;
    }
    if (partForm.quantity < 1) {
      enqueueSnackbar('Quantity must be at least 1', { variant: 'error' });
      return;
    }
    const selectedBox = boxes.find(b => b.id === partForm.box_id);
    if (!selectedBox) {
      enqueueSnackbar('Invalid box selected', { variant: 'error' });
      return;
    }
    const selectedPart = selectedBox.parts?.find(p => p.part_id === partForm.part_id);
    if (!selectedPart) {
      enqueueSnackbar('Invalid part selected for this box', { variant: 'error' });
      return;
    }
    if (partForm.quantity > selectedPart.quantity) {
      enqueueSnackbar(`Cannot assign ${partForm.quantity} parts; only ${selectedPart.quantity} available in ${selectedBox.name}`, { variant: 'error' });
      return;
    }
    setPartLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token missing');
      const res = await fetch(`https://techclinic-api.techclinic-api.workers.dev/api/repair-jobs/${selectedJob.id}/parts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(partForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign part');
      enqueueSnackbar('Part assigned to repair job!', { variant: 'success' });
      setPartForm({ part_id: '', box_id: '', quantity: 1 });
      // Update box quantity and parts
      setBoxes(prevBoxes =>
        prevBoxes.map(b =>
          b.id === partForm.box_id
            ? {
                ...b,
                quantity: b.quantity - partForm.quantity,
                parts: b.parts.map(p =>
                  p.part_id === partForm.part_id ? { ...p, quantity: p.quantity - partForm.quantity } : p
                ),
              }
            : b
        )
      );
      fetchPartsUsed(selectedJob.id);
    } catch (err) {
      console.error('Assign part error:', err);
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally {
      setPartLoading(false);
    }
  };

  // Get customer name
  const getCustomerName = useCallback((id) => {
    const c = customers.find(c => c.id === id);
    return c ? `${c.name} (${c.mobile_number})` : id || 'Unknown';
  }, [customers]);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return allJobs.filter(job => {
      if (!job) return false;
      return (
        getCustomerName(job.customer_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.status || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [allJobs, searchTerm, getCustomerName]);

  // Status badge color
  const getStatusColor = (status) => {
    if (!status || typeof status !== 'string') return 'bg-gray-200 text-gray-500';
    switch (status.toLowerCase()) {
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-200 text-gray-500';
    }
  };

  // Global loading state
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg className="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 min-h-screen">
      {/* Header with search */}
      <div className="flex flex-col items-start sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">Repair Jobs</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by customer or status"
              className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100"
              value={searchTerm}
              onChange={e => debouncedSetSearchTerm(e.target.value)}
              data-tooltip-id="search-input"
              data-tooltip-content="Search repair jobs"
            />
            <Tooltip id="search-input" place="top-start" className="hidden sm:block" />
          </div>
          <button
            className="px-4 py-2 text-sm sm:text-base rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 transition-transform duration-200 hover:scale-105 w-full sm:w-auto"
            onClick={() => {
              setForm({ customer_id: '', status: '', notes: '' });
              setEditMode(false);
              setIsAddEditDrawerOpen(true);
            }}
            data-tooltip-id="add-job"
            data-tooltip-content="Add a new repair job"
          >
            <Plus className="w-5 h-5" />
            Add Repair Job
          </button>
          <Tooltip id="add-job" place="top-start" className="hidden sm:block" />
        </div>
      </div>
      {/* Add/Edit Drawer */}
      <RepairJobDrawer
        open={isAddEditDrawerOpen}
        onClose={() => {
          setIsAddEditDrawerOpen(false);
          setEditMode(false);
        }}
        onSave={handleSave}
        form={form}
        setForm={setForm}
        loading={loading}
        customers={customers}
        editMode={editMode}
      />
      {/* Details Drawer */}
      <JobDetailsDrawer
        open={isDetailsDrawerOpen}
        onClose={() => {
          setIsDetailsDrawerOpen(false);
          setPartForm({ part_id: '', box_id: '', quantity: 1 });
        }}
        job={selectedJob || {}}
        customers={customers}
        parts={parts}
        boxes={boxes}
        partsUsed={partsUsed}
        partLoading={partLoading}
        onEdit={() => {
          setIsDetailsDrawerOpen(false);
          setEditMode(true);
          setForm(selectedJob || { customer_id: '', status: '', notes: '' });
          setIsAddEditDrawerOpen(true);
        }}
        onAssignPart={handleAssignPart}
        partForm={partForm}
        setPartForm={setPartForm}
        partLoadingState={partLoading}
      />
      {/* Repair Jobs List */}
      <div className="mb-12">
        <h4 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">All Repair Jobs</h4>
        {jobsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredJobs.length === 0 ? (
          <EmptyState text="No repair jobs found" sub="Try adding a new repair job or adjusting your search." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {filteredJobs.map(job => (
              <div
                key={job.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col gap-2 border border-gray-200/50 dark:border-gray-700/50 cursor-pointer hover:shadow-xl transition-all duration-200 sm:hover:scale-[1.02]"
                onClick={() => handleSelectJob(job)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSelectJob(job)}
                aria-label={`View details for job ${job.id}`}
                data-tooltip-id={`job-${job.id}`}
                data-tooltip-content="Click to view details"
              >
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-blue-600 dark:text-blue-400 truncate">Job ID: {job.id}</div>
                  <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(job.status)}`}>
                    {job.status || 'N/A'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 truncate">Customer: {getCustomerName(job.customer_id)}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                  Created: {job.created_at ? new Date(job.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'N/A'}
                </div>
                <Tooltip id={`job-${job.id}`} place="top-start" className="hidden sm:block" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}