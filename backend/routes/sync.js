const express = require('express');
const router = express.Router();
const EnergyReadings = require('../models/EnergyReadings');

router.post('/prices', async (req, res) => {
  try {
    const location = (req.body && req.body.location) ? req.body.location : 'EE';
    const start = (req.body && req.body.start) ? req.body.start : new Date().toISOString().split('T')[0] + 'T00:00:00Z';
    const end = (req.body && req.body.end) ? req.body.end : new Date().toISOString().split('T')[0] + 'T23:59:59Z';

    const field = location.toLowerCase();

    const response = await fetch(
      `https://dashboard.elering.ee/api/nps/price?start=${start}&end=${end}&fields=${field}`
    );

    if (!response.ok) {
      return res.status(500).json({ error: 'PRICE_API_UNAVAILABLE' });
    }

    const json = await response.json();
    const prices = json.data[field];

    let inserted = 0;
    let updated = 0;

    for (const item of prices) {
      const timestamp = new Date(item.timestamp * 1000).toISOString();

      const existing = await EnergyReadings.findOne({
        where: { timestamp, location }
      });

      if (existing) {
        await existing.update({ price_eur_mwh: item.price, source: 'API' });
        updated++;
      } else {
        await EnergyReadings.create({
          timestamp,
          location,
          price_eur_mwh: item.price,
          source: 'API'
        });
        inserted++;
      }
    }

    res.json({ message: 'Sünkroonimine õnnestus', inserted, updated });

    } catch (err) {
        console.error('Viga:', err.message);
        res.status(500).json({ error: 'PRICE_API_UNAVAILABLE', detail: err.message });
    }
});

module.exports = router;