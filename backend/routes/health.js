const express = require('express');
const router = express.Router();
const sequelize = require('../util/db');

router.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', db: 'ok' });
  } catch (err) {
    res.json({ status: 'ok', db: 'error' });
  }
});

module.exports = router;