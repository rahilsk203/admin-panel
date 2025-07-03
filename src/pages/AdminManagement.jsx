import React, { useState } from 'react';

const AdminManagement = () => {
  // Registration
  const [regForm, setRegForm] = useState({ username: '', password: '', register_key: '' });
  const [regMsg, setRegMsg] = useState('');
  // Update
  const [updForm, setUpdForm] = useState({ id: '', username: '', password: '' });
  const [updMsg, setUpdMsg] = useState('');
  // Delete
  const [delId, setDelId] = useState('');
  const [delMsg, setDelMsg] = useState('');

  // Register admin
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegMsg('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register');
      setRegMsg('Admin registered!');
      setRegForm({ username: '', password: '', register_key: '' });
    } catch (err) {
      setRegMsg(err.message);
    }
  };

  // Update admin
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdMsg('');
    try {
      const res = await fetch(`/api/admins/${updForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: updForm.username, password: updForm.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      setUpdMsg('Admin updated!');
      setUpdForm({ id: '', username: '', password: '' });
    } catch (err) {
      setUpdMsg(err.message);
    }
  };

  // Delete admin
  const handleDelete = async (e) => {
    e.preventDefault();
    setDelMsg('');
    try {
      const res = await fetch(`/api/admins/${delId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      setDelMsg('Admin deleted!');
      setDelId('');
    } catch (err) {
      setDelMsg(err.message);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Admin Management</h2>
      {/* Register */}
      <form onSubmit={handleRegister} style={{ marginBottom: 24 }}>
        <h4>Register New Admin</h4>
        <input name="username" placeholder="Username" value={regForm.username} onChange={e => setRegForm({ ...regForm, username: e.target.value })} required />{' '}
        <input name="password" type="password" placeholder="Password" value={regForm.password} onChange={e => setRegForm({ ...regForm, password: e.target.value })} required />{' '}
        <input name="register_key" placeholder="Register Key" value={regForm.register_key} onChange={e => setRegForm({ ...regForm, register_key: e.target.value })} required />{' '}
        <button type="submit">Register</button>
        {regMsg && <div>{regMsg}</div>}
      </form>
      {/* Update */}
      <form onSubmit={handleUpdate} style={{ marginBottom: 24 }}>
        <h4>Update Admin</h4>
        <input name="id" placeholder="Admin ID" value={updForm.id} onChange={e => setUpdForm({ ...updForm, id: e.target.value })} required />{' '}
        <input name="username" placeholder="New Username" value={updForm.username} onChange={e => setUpdForm({ ...updForm, username: e.target.value })} />{' '}
        <input name="password" type="password" placeholder="New Password" value={updForm.password} onChange={e => setUpdForm({ ...updForm, password: e.target.value })} />{' '}
        <button type="submit">Update</button>
        {updMsg && <div>{updMsg}</div>}
      </form>
      {/* Delete */}
      <form onSubmit={handleDelete} style={{ marginBottom: 24 }}>
        <h4>Delete Admin</h4>
        <input name="id" placeholder="Admin ID" value={delId} onChange={e => setDelId(e.target.value)} required />{' '}
        <button type="submit">Delete</button>
        {delMsg && <div>{delMsg}</div>}
      </form>
    </div>
  );
};

export default AdminManagement; 