# Energy Monitoring and Advisory Dashboard

## 1. Keskkonna seadistamine

**Vajalikud tööriistad:**
- Node.js v18+
- MySQL v8+

**Paigaldamine:**
```bash
cd backend && npm install
cd ../frontend && npm install
```

**Seadista `.env` fail `backend/` kausta:**
```
DB_NAME=EnergyDB
DB_USER=root
DB_PASS=sinuparool
DB_HOST=localhost
PORT=3001
```

---

## 2. Andmebaasi migratsioon

Loo MySQL andmebaas:
```sql
CREATE DATABASE EnergyDB;
```

Tabelid luuakse automaatselt kui backend käivitub (`sequelize.sync()`).

---

## 3. JSON andmete importimine

Aseta `energy_dump.json` fail `backend/` kausta.

Käivita import läbi API:
```
POST http://localhost:3001/api/import/json
```

---

## 4. Käivitamine

**Backend:**
```bash
cd backend
node index.js
```
Töötab: `http://localhost:3001`

**Frontend:**
```bash
cd frontend
npm run dev
```
Töötab: `http://localhost:5173`

---

## 5. Testide käivitamine

```bash
cd backend
npm test
```

Testiraamistik: Jest + Supertest

---

## 6. Arhitektuur

```
Frontend (React) → Backend (Express) → MySQL andmebaas
                                     ↕
                              Eleringi väline API
```

- **Frontend** saadab päringud backendile
- **Backend** suhtleb andmebaasi ja välise API-ga
- **Välist API-t** kutsutakse ainult backendist

---

## 7. API endpointid

| Meetod | URL | Kirjeldus |
|--------|-----|-----------|
| GET | `/api/health` | Serveri ja DB olek |
| POST | `/api/import/json` | Impordi energy_dump.json |
| GET | `/api/readings?start=...&end=...&location=...` | Loe andmeid |
| DELETE | `/api/readings?source=UPLOAD` | Kustuta UPLOAD andmed |
| POST | `/api/sync/prices` | Sünkroniseeri Eleringi API |

---

## 8. Peamised sõltuvused

**Backend:**
- `express` — HTTP server ja routing
- `sequelize` — ORM andmebaasi halduseks
- `mysql2` — MySQL draiver
- `cors` — Lubab frontendil backendiga suhelda
- `dotenv` — Keskkonnamuutujate haldus
- `jest` + `supertest` — Testimine

**Frontend:**
- `react` — Kasutajaliides
- `recharts` — Graafikute kuvamine
- `vite` — Arendusserver