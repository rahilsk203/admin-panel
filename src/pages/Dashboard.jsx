import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [counts, setCounts] = useState({ accessories: null, boxes: null, parts: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      fetch('https://techclinic-api.techclinic-api.workers.dev/api/accessories/count').then(res => res.json()),
      fetch('https://techclinic-api.techclinic-api.workers.dev/api/boxes/count').then(res => res.json()),
      fetch('https://techclinic-api.techclinic-api.workers.dev/api/parts/count').then(res => res.json()),
    ])
      .then(([a, b, p]) => {
        setCounts({ accessories: a.count, boxes: b.count, parts: p.count });
      })
      .catch(err => setError('Failed to fetch counts'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Dashboard</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div style={{ display: 'flex', gap: 32, marginTop: 24 }}>
        <div style={{ border: '1px solid #ccc', padding: 16, minWidth: 120 }}>
          <h4>Accessories</h4>
          <div style={{ fontSize: 32 }}>{counts.accessories !== null ? counts.accessories : '-'}</div>
        </div>
        <div style={{ border: '1px solid #ccc', padding: 16, minWidth: 120 }}>
          <h4>Boxes</h4>
          <div style={{ fontSize: 32 }}>{counts.boxes !== null ? counts.boxes : '-'}</div>
        </div>
        <div style={{ border: '1px solid #ccc', padding: 16, minWidth: 120 }}>
          <h4>Parts</h4>
          <div style={{ fontSize: 32 }}>{counts.parts !== null ? counts.parts : '-'}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 