import { useState } from 'react';
import Dashboard from './DashBoard';

function App() {
  const [location, setLocation] = useState('EE');
  const [start, setStart] = useState('2026-04-07T00:00:00Z');
  const [end, setEnd] = useState('2026-04-08T23:59:59Z');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/sync/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, start, end })
      });

      const data = await response.json();

      if (!response.ok) {
        setError('Sünkroonimine ebaõnnestus. Proovi uuesti.');
      } else {
        setMessage(`Hinnad sünkrooniti edukalt. Lisatud: ${data.inserted}, uuendatud: ${data.updated}`);
      }
    } catch (err) {
      setError('Serveriga ühendamine ebaõnnestus.');
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/readings?source=UPLOAD', {
        method: 'DELETE'
      });
      const data = await response.json();
      setMessage(data.message || data.error);
    } catch (err) {
      setMessage('Cleanup failed. Please try again.');
    }
  };

  return (
    <div style={{ padding: '2rem', padding: '2rem', margin: '0 auto' }}>
      <h1>Energy Dashboard</h1>

      <h2>Sünkroniseeri elektrihinnad</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label>Algusaeg:</label><br />
      <input
        type="date"
        defaultValue="2026-04-07"
        onChange={e => {
          const iso = e.target.value + 'T00:00:00Z';
          setStart(iso);
          console.log('start:', iso);
        }}
      />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Lõppaeg:</label><br />
      <input
        type="date"
        defaultValue="2026-04-08"
        onChange={e => {
          const iso = e.target.value + 'T23:59:59Z';
          setEnd(iso);
          console.log('end:', iso);
        }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Piirkond:</label><br />
        <select value={location} onChange={e => setLocation(e.target.value)}>
          <option value="EE">EE</option>
          <option value="LV">LV</option>
          <option value="FI">FI</option>
        </select>
      </div>

      <button onClick={handleSync} disabled={loading}>
        {loading ? 'Loading...' : 'Sync Prices'}
      </button>

      <button onClick={handleDelete} style={{ marginLeft: '1rem' }}>
        Delete UPLOAD data
      </button>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <Dashboard />
    </div>
  );
}

export default App;