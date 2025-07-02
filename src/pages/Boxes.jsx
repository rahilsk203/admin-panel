import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const API = 'https://techclinic-api.techclinic-api.workers.dev/api/boxes';

const defaultBox = { id: '', name: '', location: '', company: '', parts_type: '' };
const companies = ['Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Other'];
const partsTypes = ['Display', 'Battery', 'Speaker', 'Charger', 'Other'];

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

export default function Boxes() {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(defaultBox);
  const { enqueueSnackbar } = useSnackbar();

  const token = localStorage.getItem('token');

  const fetchBoxes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBoxes(res.data);
    } catch (e) {
      enqueueSnackbar('Failed to load boxes', { variant: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBoxes();
    // eslint-disable-next-line
  }, []);

  const handleOpen = (box = defaultBox) => {
    setForm(box);
    setEditMode(!!box.id);
    setOpen(true);
  };
  const handleClose = () => {
    setForm(defaultBox);
    setEditMode(false);
    setOpen(false);
  };

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    try {
      if (!form.name) {
        enqueueSnackbar('Name is required', { variant: 'warning' });
        return;
      }
      if (editMode) {
        await axios.put(`${API}/${form.id}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        enqueueSnackbar('Box updated', { variant: 'success' });
      } else {
        await axios.post(API, { ...form, id: crypto.randomUUID() }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        enqueueSnackbar('Box added', { variant: 'success' });
      }
      handleClose();
      fetchBoxes();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.error || 'Error saving box', { variant: 'error' });
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this box?')) return;
    try {
      await axios.delete(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      enqueueSnackbar('Box deleted', { variant: 'success' });
      fetchBoxes();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.error || 'Error deleting box', { variant: 'error' });
    }
  };

  return (
    <div className="">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Boxes</h2>
        <button
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
          onClick={() => handleOpen()}
        >
          <IconAdd /> Add Box
        </button>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Parts Type</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {boxes.map(box => (
              <tr key={box.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap">{box.name}</td>
                <td className="px-4 py-2 whitespace-nowrap">{box.location}</td>
                <td className="px-4 py-2 whitespace-nowrap">{box.company}</td>
                <td className="px-4 py-2 whitespace-nowrap">{box.parts_type}</td>
                <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                  <button title="Edit" onClick={() => handleOpen(box)} className="p-1 rounded hover:bg-blue-100"><IconEdit /></button>
                  <button title="Delete" onClick={() => handleDelete(box.id)} className="p-1 rounded hover:bg-red-100"><IconDelete /></button>
                </td>
              </tr>
            ))}
            {boxes.length === 0 && !loading && (
              <tr><td colSpan={5} className="text-center py-4 text-gray-400">No boxes found</td></tr>
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
                {editMode ? 'Edit Box' : 'Add Box'}
              </h3>
              <form
                onSubmit={e => { e.preventDefault(); handleSubmit(); }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                    >
                      <option value=""></option>
                      {companies.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 mb-1 font-medium">Parts Type</label>
                    <select
                      name="parts_type"
                      value={form.parts_type}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70"
                    >
                      <option value=""></option>
                      {partsTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
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