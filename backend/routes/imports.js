const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const EnergyReadings = require('../models/EnergyReadings');

router.post('/json', async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../energy_dump.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);

    let inserted = 0;
    let skipped = 0;
    let duplicates_detected = 0;

    for (const row of data) {
      // 1. Valideeri timestamp
      const ts = new Date(row.timestamp);
      if (isNaN(ts.getTime()) || typeof row.timestamp !== 'string') {
        skipped++;
        continue;
      }

      // 2. Puhasta location
      const location = row.location ? row.location : 'EE';

      // 3. Kontrolli price
      if (typeof row.price_eur_mwh === 'string') {
        skipped++;
        continue;
      }

      // 4. Kontrolli duplikaati
      const existing = await EnergyReadings.findOne({
        where: { timestamp: ts, location: location }
      });

      if (existing) {
        duplicates_detected++;
        continue;
      }

      // 5. Salvesta
      await EnergyReadings.create({
        timestamp: ts.toISOString(),
        location: location,
        price_eur_mwh: row.price_eur_mwh,
        source: 'UPLOAD'
      });

      inserted++;
    }

    res.json({
      message: 'Import completed',
      inserted,
      skipped,
      duplicates_detected
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Import ebaõnnestus' });
  }
});

module.exports = router;