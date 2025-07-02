import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const API = 'https://techclinic-api.techclinic-api.workers.dev/api/admins';
const REGISTER_API = 'https://techclinic-api.techclinic-api.workers.dev/api/register';

const defaultAdmin = { id: '', username: '', password: '' };

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
function IconEye({ show }) {
  return show ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12.001C3.226 15.477 7.113 19.5 12 19.5c1.658 0 3.237-.356 4.646-.99m3.374-2.14A10.45 10.45 0 0022.066 12c-1.292-3.477-5.179-7.5-10.066-7.5-1.272 0-2.496.222-3.646.623M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c0-1.192.214-2.333.611-3.382m2.076-3.35A10.477 10.477 0 0112 4.5c4.887 0 8.774 4.023 10.066 7.5-.334.902-.83 1.927-1.465 2.963M15.75 15.75A6.75 6.75 0 016.75 8.25m9.5 9.5l-13-13" /></svg>
  );
}

export default function Admins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(defaultAdmin);
  const [showPassword, setShowPassword] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(atob(token.split('.')[1])).username;

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(res.data);
    } catch (e) {
      enqueueSnackbar('Failed to load admins', { variant: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
    // eslint-disable-next-line
  }, []);

  const handleOpen = (admin = defaultAdmin) => {
    setForm(admin);
    setEditMode(!!admin.id);
    setOpen(true);
    setShowPassword(false);
  };
  const handleClose = () => {
    setForm(defaultAdmin);
    setEditMode(false);
    setOpen(false);
    setShowPassword(false);
  };

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.username) return enqueueSnackbar('Username is required', { variant: 'warning' });
    if (!editMode && !form.password) return enqueueSnackbar('Password is required', { variant: 'warning' });
    try {
      if (editMode) {
        await axios.put(`${API}/${form.id}`, { username: form.username, password: form.password || undefined }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        enqueueSnackbar('Admin updated', { variant: 'success' });
      } else {
        await axios.post(REGISTER_API, { username: form.username, password: form.password, register_key: 'techclinic@superadmin' });
        enqueueSnackbar('Admin added', { variant: 'success' });
      }
      handleClose();
      fetchAdmins();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.error || 'Error saving admin', { variant: 'error' });
    }
  };

  const handleDelete = async (id, username) => {
    if (username === currentUser) return enqueueSnackbar('You cannot delete yourself', { variant: 'warning' });
    if (!window.confirm('Delete this admin?')) return;
    try {
      await axios.delete(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      enqueueSnackbar('Admin deleted', { variant: 'success' });
      fetchAdmins();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.error || 'Error deleting admin', { variant: 'error' });
    }
  };

  return (
    <div className="">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Admins</h2>
        <button
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
          onClick={() => handleOpen()}
        >
          <IconAdd /> Add Admin
        </button>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {admins.map(admin => (
              <tr key={admin.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap">{admin.username}</td>
                <td className="px-4 py-2 whitespace-nowrap">{admin.created_at ? new Date(admin.created_at).toLocaleString() : ''}</td>
                <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                  <button title="Edit" onClick={() => handleOpen(admin)} className="p-1 rounded hover:bg-blue-100"><IconEdit /></button>
                  <button title="Delete" onClick={() => handleDelete(admin.id, admin.username)} className="p-1 rounded hover:bg-red-100"><IconDelete /></button>
                </td>
              </tr>
            ))}
            {admins.length === 0 && !loading && (
              <tr><td colSpan={3} className="text-center py-4 text-gray-400">No admins found</td></tr>
            )}
          </tbody>
        </table>
        {loading && <div className="p-4 text-center text-gray-500">Loading...</div>}
      </div>
      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-xs p-6 relative animate-fadeIn">
            <h3 className="text-lg font-bold mb-4">{editMode ? 'Edit Admin' : 'Add Admin'}</h3>
            <form
              onSubmit={e => { e.preventDefault(); handleSubmit(); }}
              className="space-y-3"
            >
              <div>
                <label className="block text-gray-700 mb-1">Username</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    required={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                    placeholder={editMode ? 'Leave blank to keep current password' : ''}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 hover:text-blue-600 focus:outline-none"
                    onClick={() => setShowPassword(s => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <IconEye show={showPassword} />
                  </button>
                </div>
                {editMode && <div className="text-xs text-gray-400 mt-1">Leave blank to keep current password</div>}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={handleClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold">{editMode ? 'Update' : 'Add'}</button>
              </div>
            </form>
            <button onClick={handleClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
