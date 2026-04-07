const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const EnergyReadings = require('../models/EnergyReadings');

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

module.exports = router;