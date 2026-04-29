const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');

// Mock andmebaas
jest.mock('../models/EnergyReadings', () => ({
  findOne: jest.fn(),
  create: jest.fn()
}));

const EnergyReadings = require('../models/EnergyReadings');
const importRouter = require('../routes/imports');

const app = express();
app.use(express.json());
app.use('/api/import', importRouter);

describe('JSON Import', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('vigane timestamp jäetakse vahele', async () => {
    // Loo ajutine testfail
    const testData = [
      { timestamp: 'invalid-date', location: 'EE', price_eur_mwh: 45.5 }
    ];
    fs.writeFileSync(
      path.join(__dirname, '../energy_dump.json'),
      JSON.stringify(testData)
    );

    const res = await request(app).post('/api/import/json');
    expect(res.body.skipped).toBe(1);
    expect(res.body.inserted).toBe(0);
  });

  test('duplikaadid tuvastatakse', async () => {
    const testData = [
      { timestamp: '2026-01-01T10:00:00Z', location: 'EE', price_eur_mwh: 45.5 },
      { timestamp: '2026-01-01T10:00:00Z', location: 'EE', price_eur_mwh: 45.5 }
    ];
    fs.writeFileSync(
      path.join(__dirname, '../energy_dump.json'),
      JSON.stringify(testData)
    );

    // Esimene kirje pole duplikaat, teine on
    EnergyReadings.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 1 });
    EnergyReadings.create.mockResolvedValue({});

    const res = await request(app).post('/api/import/json');
    expect(res.body.duplicates_detected).toBe(1);
    expect(res.body.inserted).toBe(1);
  });

});