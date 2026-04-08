import { useState } from 'react';

function App() {
  const [location, setLocation] = useState('EE');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
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

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Energy Dashboard</h1>

      <h2>Sünkroniseeri elektrihinnad</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label>Algusaeg:</label><br />
        <input
          type="datetime-local"
          onChange={e => setStart(new Date(e.target.value).toISOString())}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Lõppaeg:</label><br />
        <input
          type="datetime-local"
          onChange={e => setEnd(new Date(e.target.value).toISOString())}
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

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default App;