const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const EnergyReadings = require('../models/EnergyReadings');

const isoUtcRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

router.get('/', async (req, res) => {
  const { start, end, location } = req.query;

  // Valideeri parameetrid
  if (!start || !end || !location) {
    return res.status(400).json({ error: 'start, end ja location on kohustuslikud' });
  }

  if (!['EE', 'LV', 'FI'].includes(location)) {
    return res.status(400).json({ error: 'location peab olema EE, LV või FI' });
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return res.status(400).json({ error: 'start ja end peavad olema ISO 8601 formaadis' });
  }

  if (!isoUtcRegex.test(start) || !isoUtcRegex.test(end)) {
    return res.status(400).json({ error: 'start ja end peavad olema ISO 8601 UTC formaadis (nt 2026-01-01T00:00:00Z)' });
  }

  if (new Date(end) <= new Date(start)) {
    return res.status(400).json({ error: 'end peab olema suurem kui start' });
  }

  try {
    const readings = await EnergyReadings.findAll({
      where: {
        location,
        timestamp: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    res.json(readings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Andmebaasi viga' });
  }
});

router.delete('/', async (req, res) => {
  const { source } = req.query;

  if (source !== 'UPLOAD') {
    return res.status(400).json({ error: 'Ainult source=UPLOAD kustutamine on lubatud' });
  }

  try {
    const count = await EnergyReadings.destroy({
      where: { source: 'UPLOAD' }
    });

    if (count === 0) {
      return res.json({ message: 'No UPLOAD records found.' });
    }

    res.json({ message: `Deleted ${count} uploaded records.` });
  } catch (err) {
    res.status(500).json({ error: 'Cleanup failed. Please try again.' });
  }
});

module.exports = router;