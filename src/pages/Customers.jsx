 import React, { useState, useEffect } from 'react';

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

export default function Customers() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState('');

  // Fetch all customers (simple, for demo; ideally paginated)
  useEffect(() => {
    setFetching(true);
    fetch('/api/customers', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(r => r.json())
      .then(data => {
        setCustomers(Array.isArray(data) ? data : []);
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, [success]);

  // Add customer
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add customer');
      setSuccess('Customer added successfully!');
      setForm(initialForm);
    } catch (err) {
      setError(err.message);
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
      <h2 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-300">Add Customer / Mobile</h2>
      <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-[#23263a]/80 rounded-2xl shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <input required className="input" placeholder="Customer Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <input required className="input" placeholder="Mobile Number" value={form.mobile_number} onChange={e => setForm(f => ({ ...f, mobile_number: e.target.value }))} />
        <input className="input" placeholder="Location (City, Area, Pin Code)" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
        <input className="input" placeholder="Mobile Brand" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
        <input className="input" placeholder="Mobile Model" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} />
        <input className="input" placeholder="IMEI Number (optional)" value={form.imei} onChange={e => setForm(f => ({ ...f, imei: e.target.value }))} />
        <input className="input" placeholder="Mobile Condition" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} />
        <input className="input" placeholder="Problem Description" value={form.problem_description} onChange={e => setForm(f => ({ ...f, problem_description: e.target.value }))} />
        <input type="date" className="input" placeholder="Received Date" value={form.received_date} onChange={e => setForm(f => ({ ...f, received_date: e.target.value }))} />
        <div className="col-span-1 md:col-span-2 flex gap-2 mt-2">
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add Customer'}</button>
          {error && <span className="text-red-500 ml-2">{error}</span>}
          {success && <span className="text-green-600 ml-2">{success}</span>}
        </div>
      </form>

      <h2 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-300">All Customers</h2>
      <input className="input mb-4 w-full max-w-md" placeholder="Search by name or mobile" value={search} onChange={e => setSearch(e.target.value)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fetching ? (
          <div className="col-span-2 text-center text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 text-center text-gray-500">No customers found.</div>
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