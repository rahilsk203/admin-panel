import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { Tooltip } from 'react-tooltip';
import { X, Plus, Search, Package } from 'lucide-react';

const initialForm = {
  name: '',
  mobile_number: '',
  location: '',
  brand: '',
  model: '',
  imei: '',
  condition: '',
  problem_description: '',
  received_date: '',
};

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
      <Package className="w-20 h-20 mb-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
      <div className="text-xl font-semibold">No customers found</div>
      <div className="text-sm mt-1">Start by adding a new customer.</div>
    </div>
  );
}

function CustomerDrawer({ open, onClose, onSave, form, setForm, loading }) {
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
        className={`relative w-full h-full sm:w-[480px] sm:max-w-[90vw] bg-gradient-to-b from-white/90 to-gray-100/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-md shadow-2xl border-l border-gray-200/50 dark:border-gray-700/50 flex flex-col rounded-l-3xl sm:rounded-t-none transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ boxShadow: '0 8px 32px 0 rgba(60,60,120,0.18), 0 1.5px 8px 0 rgba(60,60,120,0.10)' }}
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
            Add Customer
          </h3>
          <div className="border-b border-gray-200/50 dark:border-gray-700/50 mb-6 mx-4 sm:mx-6" />
          <form id="customer-form" onSubmit={onSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-6 pb-24 flex-1 overflow-y-auto">
            <div className="sm:col-span-2">
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Name</label>
              <input
                required
                className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                data-tooltip-id="name-input"
                data-tooltip-content="Enter customer name"
              />
              <Tooltip id="name-input" place="top-start" className="hidden sm:block" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Mobile Number</label>
              <input
                required
                type="tel"
                className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                value={form.mobile_number}
                onChange={e => setForm(f => ({ ...f, mobile_number: e.target.value }))}
                data-tooltip-id="mobile-input"
                data-tooltip-content="Enter mobile number"
              />
              <Tooltip id="mobile-input" place="top-start" className="hidden sm:block" />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Location (City, Area, Pin Code)</label>
              <input
                className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                data-tooltip-id="location-input"
                data-tooltip-content="Enter city, area, pin code"
              />
              <Tooltip id="location-input" place="top-start" className="hidden sm:block" />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Mobile Brand</label>
              <input
                className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                value={form.brand}
                onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                data-tooltip-id="brand-input"
                data-tooltip-content="Enter mobile brand"
              />
              <Tooltip id="brand-input" place="top-start" className="hidden sm:block" />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Mobile Model</label>
              <input
                className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                value={form.model}
                onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                data-tooltip-id="model-input"
                data-tooltip-content="Enter mobile model"
              />
              <Tooltip id="model-input" place="top-start" className="hidden sm:block" />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">IMEI Number (optional)</label>
              <input
                className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                value={form.imei}
                onChange={e => setForm(f => ({ ...f, imei: e.target.value }))}
                data-tooltip-id="imei-input"
                data-tooltip-content="Enter IMEI number (optional)"
              />
              <Tooltip id="imei-input" place="top-start" className="hidden sm:block" />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Mobile Condition</label>
              <input
                className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                value={form.condition}
                onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
                data-tooltip-id="condition-input"
                data-tooltip-content="Enter mobile condition"
              />
              <Tooltip id="condition-input" place="top-start" className="hidden sm:block" />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Problem Description</label>
              <input
                className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                value={form.problem_description}
                onChange={e => setForm(f => ({ ...f, problem_description: e.target.value }))}
                data-tooltip-id="problem-input"
                data-tooltip-content="Enter problem description"
              />
              <Tooltip id="problem-input" place="top-start" className="hidden sm:block" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Received Date</label>
              <input
                type="date"
                className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
                value={form.received_date}
                onChange={e => setForm(f => ({ ...f, received_date: e.target.value }))}
                data-tooltip-id="received-date-input"
                data-tooltip-content="Select received date"
              />
              <Tooltip id="received-date-input" place="top-start" className="hidden sm:block" />
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
              form="customer-form"
              className="px-5 py-3 text-sm sm:text-base rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-transform duration-200 hover:scale-105 flex items-center gap-2 min-w-[120px]"
              disabled={loading}
              data-tooltip-id="save-button"
              data-tooltip-content="Save customer"
            >
              {loading ? (
                <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24" aria-label="Loading">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <Plus className="w-6 h-6" />
              )}
              Save
            </button>
            <Tooltip id="save-button" place="top-start" className="hidden sm:block" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Fetch all customers
  useEffect(() => {
    setInitialLoading(true);
    setFetching(true);
    fetch('https://techclinic-api.techclinic-api.workers.dev/api/customers', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(r => r.json())
      .then(data => {
        setCustomers(Array.isArray(data) ? data : []);
        setFetching(false);
        setInitialLoading(false);
      })
      .catch(() => {
        enqueueSnackbar('Failed to fetch customers', { variant: 'error' });
        setFetching(false);
        setInitialLoading(false);
      });
  }, [loading, enqueueSnackbar]);

  // Add customer
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mobile_number) {
      enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('https://techclinic-api.techclinic-api.workers.dev/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add customer');
      enqueueSnackbar('Customer added successfully!', { variant: 'success' });
      setForm(initialForm);
      setModalOpen(false);
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Filtered customers
  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile_number?.includes(search)
  );

  // Global loading state
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen" aria-label="Loading customers">
        <svg className="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 min-h-screen">
      <div className="flex flex-col items-start sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">Customers</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or mobile"
              className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 dark:bg-gray-800/80 dark:text-gray-100 transition"
              value={search}
              onChange={e => setSearch(e.target.value)}
              data-tooltip-id="search-input"
              data-tooltip-content="Search customers"
            />
            <Tooltip id="search-input" place="top-start" className="hidden sm:block" />
          </div>
          <button
            className="px-4 py-2 text-sm sm:text-base rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 transition-transform duration-200 hover:scale-105 w-full sm:w-auto"
            onClick={() => setModalOpen(true)}
            data-tooltip-id="add-customer"
            data-tooltip-content="Add a new customer"
          >
            <Plus className="w-5 h-5" />
            Add Customer
          </button>
          <Tooltip id="add-customer" place="top-start" className="hidden sm:block" />
        </div>
      </div>
      <CustomerDrawer
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSubmit}
        form={form}
        setForm={setForm}
        loading={loading}
      />
      <div className="mb-12">
        <h4 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">All Customers</h4>
        {fetching ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {filtered.map(c => (
              <div
                key={c.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col gap-2 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-200 sm:hover:scale-[1.02]"
                role="button"
                tabIndex={0}
                aria-label={`View customer ${c.name}`}
                data-tooltip-id={`customer-${c.id}`}
                data-tooltip-content="Customer details"
              >
                <div className="font-semibold text-blue-600 dark:text-blue-400 truncate">{c.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 truncate">Mobile: {c.mobile_number}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 truncate">Location: {c.location || 'N/A'}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 truncate">Brand: {c.brand || 'N/A'} | Model: {c.model || 'N/A'}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 truncate">IMEI: {c.imei || 'N/A'}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 truncate">Condition: {c.condition || 'N/A'}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 truncate">Problem: {c.problem_description || 'N/A'}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                  Received: {c.received_date ? new Date(c.received_date).toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'N/A'}
                </div>
                <Tooltip id={`customer-${c.id}`} place="top-start" className="hidden sm:block" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}