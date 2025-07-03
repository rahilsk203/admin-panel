import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';

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
    <div className="animate-pulse bg-white rounded-xl shadow p-4 flex flex-col gap-2 min-h-[120px]">
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-3 bg-gray-200 rounded w-1/4" />
      <div className="h-3 bg-gray-200 rounded w-1/4" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2z" />
      </svg>
      <div className="text-lg font-semibold">No customers found</div>
      <div className="text-sm">Start by adding a new customer.</div>
    </div>
  );
}

function CustomerDrawer({ open, onClose, onSave, form, setForm, loading }) {
  return (
    <div className={`fixed inset-0 z-40 flex items-end sm:items-center justify-end transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}> 
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        tabIndex={-1}
        aria-label="Close drawer"
      />
      {/* Drawer */}
      <div
        className={`relative w-full sm:w-[480px] h-full bg-white/95 dark:bg-[#23263a]/95 shadow-2xl border-l border-blue-100 dark:border-gray-800 flex flex-col max-w-full rounded-l-2xl sm:rounded-l-3xl transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ boxShadow: '0 8px 32px 0 rgba(60,60,120,0.18), 0 1.5px 8px 0 rgba(60,60,120,0.10)' }}
      >
        <div className="flex-1 flex flex-col h-full transition-all duration-300 ease-in-out">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-full p-2 bg-white/80 dark:bg-[#23263a]/80 z-10"
            aria-label="Close drawer"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-2 text-center tracking-tight px-6 pt-10">
            Add Customer
          </h3>
          <div className="border-b border-blue-100 dark:border-gray-800 mb-4 mx-6" />
          <form id="customer-form" onSubmit={onSave} className="space-y-4 px-6 pb-24 flex-1 overflow-y-auto">
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Customer Name</label>
              <input required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70 dark:bg-[#23263a]/80 dark:text-gray-100" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Mobile Number</label>
              <input required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70 dark:bg-[#23263a]/80 dark:text-gray-100" value={form.mobile_number} onChange={e => setForm(f => ({ ...f, mobile_number: e.target.value }))} />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Location (City, Area, Pin Code)</label>
              <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Mobile Brand</label>
              <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Mobile Model</label>
              <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">IMEI Number (optional)</label>
              <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70" value={form.imei} onChange={e => setForm(f => ({ ...f, imei: e.target.value }))} />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Mobile Condition</label>
              <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Problem Description</label>
              <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70" value={form.problem_description} onChange={e => setForm(f => ({ ...f, problem_description: e.target.value }))} />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Received Date</label>
              <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70" value={form.received_date} onChange={e => setForm(f => ({ ...f, received_date: e.target.value }))} />
            </div>
            <div className="h-24 sm:hidden" />
          </form>
          <div className="absolute bottom-0 left-0 w-full bg-white/95 dark:bg-[#23263a]/95 border-t border-blue-100 dark:border-gray-800 flex justify-end gap-2 px-6 py-4 z-50 rounded-b-2xl shadow-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-100 font-semibold shadow"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="customer-form"
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
              disabled={loading}
            >
              Save
            </button>
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
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Fetch all customers
  useEffect(() => {
    setFetching(true);
    fetch('https://techclinic-api.techclinic-api.workers.dev/api/customers', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(r => r.json())
      .then(data => {
        setCustomers(Array.isArray(data) ? data : []);
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, [loading]);

  // Add customer
  const handleSubmit = async (e) => {
    e.preventDefault();
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

  return (
    <div className="max-w-4xl mx-auto py-8 px-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300">Customers</h2>
        <button className="btn btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Customer
        </button>
      </div>
      <CustomerDrawer open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSubmit} form={form} setForm={setForm} loading={loading} />
      <input className="input input-bordered mb-4 w-full max-w-md" placeholder="Search by name or mobile" value={search} onChange={e => setSearch(e.target.value)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fetching ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : filtered.map(c => (
          <div key={c.id} className="rounded-xl bg-white/90 dark:bg-[#23263a]/90 shadow p-4 flex flex-col gap-1 border border-blue-100 dark:border-gray-800">
            <div className="font-semibold text-blue-700 dark:text-blue-200">{c.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Mobile: {c.mobile_number}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Location: {c.location}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Brand: {c.brand} | Model: {c.model}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">IMEI: {c.imei}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Condition: {c.condition}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Problem: {c.problem_description}</div>
            <div className="text-xs text-gray-400">Received: {c.received_date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Tailwind utility classes for input/button
// .input { @apply px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full; }
// .btn-primary { @apply px-4 py-2 rounded bg-gradient-to-r from-blue-600 to-purple-500 text-white font-semibold shadow hover:from-blue-700 hover:to-purple-600 transition; } 