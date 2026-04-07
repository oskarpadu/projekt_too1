import { useEffect, useState } from 'react';

function App() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/health')
      .then(res => res.json())
      .then(data => setStatus(data))
      .catch(() => setStatus({ status: 'error', db: 'error' }));
  }, []);

  return (
    <div>
      <h1>Energy Dashboard</h1>
      {status === null && <p>Ühendun backendiga...</p>}
      {status?.status === 'ok' && <p>✅ Backend OK</p>}
      {status?.status === 'error' && <p>❌ Backend ei tööta</p>}
    </div>
  );
}

export default App;