import React, { useState, useEffect } from 'react';

const BoxAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch('https://techclinic-api.techclinic-api.workers.dev/api/boxes/alerts')
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error || 'Failed to fetch alerts');
        setAlerts(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Box Alerts (Low Stock)</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {alerts.length === 0 && !loading ? (
        <div>No low stock alerts.</div>
      ) : (
        <ul>
          {alerts.map((a) => (
            <li key={a.id}>
              Box: {a.name} (ID: {a.id}), Part: {a.part_name}, Quantity: {a.quantity}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BoxAlerts; 