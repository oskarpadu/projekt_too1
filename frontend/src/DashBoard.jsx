import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function Dashboard() {
  const [location, setLocation] = useState('EE');
  const today = new Date().toISOString().split('T')[0];
  const [start, setStart] = useState('2026-04-07T00:00:00Z');
  const [end, setEnd] = useState('2026-04-08T23:59:59Z');
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState({ EE: [], LV: [], FI: [] });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
  setLoading(true);
  try {
    const res = await fetch(
      `http://localhost:3001/api/readings?start=${start}&end=${end}&location=${location}`
    );
    const json = await res.json();
    setData(Array.isArray(json) ? json : []);

    const [eeRes, lvRes, fiRes] = await Promise.all([
      fetch(`http://localhost:3001/api/readings?start=${start}&end=${end}&location=EE`),
      fetch(`http://localhost:3001/api/readings?start=${start}&end=${end}&location=LV`),
      fetch(`http://localhost:3001/api/readings?start=${start}&end=${end}&location=FI`)
    ]);
    const [ee, lv, fi] = await Promise.all([eeRes.json(), lvRes.json(), fiRes.json()]);
    setAllData({ EE: ee, LV: lv, FI: fi });

  } catch (err) {
    console.error(err);
  }
  setLoading(false);
};

  useEffect(() => { fetchData(); }, []);

  // Graafik 1: Price over time
  const priceOverTime = data.map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit' }),
    price: d.price_eur_mwh
  }));

  // Graafik 2: Daily average
  const dailyAvg = Object.entries(
    data.reduce((acc, d) => {
      const day = new Date(d.timestamp).toLocaleDateString('et-EE');
      if (!acc[day]) acc[day] = [];
      acc[day].push(d.price_eur_mwh);
      return acc;
    }, {})
  ).map(([day, prices]) => ({
    day,
    avg: +(prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)
  }));

  // Graafik 3: Average per location
  const avgPerLocation = ['EE', 'LV', 'FI'].map(loc => {
    const prices = (allData[loc] || []).map(d => d.price_eur_mwh).filter(p => p !== null);
    return {
      location: loc,
      avg: prices.length ? +(prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2) : 0
    };
  });

  // Graafik 4: Compare locations over time
  const compareData = allData.EE.map((d, i) => ({
    time: new Date(d.timestamp).toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit' }),
    EE: d.price_eur_mwh,
    LV: allData.LV[i]?.price_eur_mwh ?? null,
    FI: allData.FI[i]?.price_eur_mwh ?? null
  }));

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Dashboard</h2>

      {/* Filtrid */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div>
        <label>Algusaeg:</label><br />
        <input
          type="date"
          defaultValue="2026-04-07"
          onChange={e => setStart(e.target.value + 'T00:00:00Z')}
        />
      </div>
      <div>
        <label>Lõppaeg:</label><br />
        <input
          type="date"
          defaultValue="2026-04-08"
          onChange={e => setEnd(e.target.value + 'T23:59:59Z')}
        />
      </div>
        <div>
          <label>Piirkond:</label><br />
          <select value={location} onChange={e => setLocation(e.target.value)}>
            <option value="EE">EE</option>
            <option value="LV">LV</option>
            <option value="FI">FI</option>
          </select>
        </div>
        <div style={{ alignSelf: 'flex-end' }}>
          <button onClick={fetchData} disabled={loading}>
            {loading ? 'Laen...' : 'Otsi'}
          </button>
        </div>
      </div>

      {data.length === 0 && !loading && <p>Andmed puuduvad valitud vahemikus.</p>}

      {/* Graafik 1 */}
      <h3>Hind ajas</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={priceOverTime}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="price" stroke="#8884d8" dot={false} />
        </LineChart>
      </ResponsiveContainer>

      {/* Graafik 2 */}
      <h3>Päevane keskmine hind</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dailyAvg}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="avg" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>

      {/* Graafik 3 */}
      <h3>Keskmine hind piirkonna järgi</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={avgPerLocation}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="location" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="avg" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      {/* Graafik 4 */}
      <h3>Piirkondade võrdlus</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={compareData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="EE" stroke="#8884d8" dot={false} />
          <Line type="monotone" dataKey="LV" stroke="#82ca9d" dot={false} />
          <Line type="monotone" dataKey="FI" stroke="#ff7300" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Dashboard;