const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const importRouter = require('./routes/imports.js');
const readingsRouter = require('./routes/readings.js');
const syncRouter = require('./routes/sync.js');

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api/import', importRouter);
app.use('/api/readings', readingsRouter);
app.use('/api/sync', syncRouter);

const sequelize = require('./util/db');

const models = require('./models/EnergyReadings');
sequelize.models = models;

const healthRouter = require('./routes/health');
app.use('/api', healthRouter);

sequelize
    .sync()
    .then(() => {
        console.log('Database synced successfully.');
    })
    .catch((err) => {
        console.error('Error syncing database:', err);
    });

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Energy Price API!' });
});

app.listen(3001, () => {
    console.log('Server is running on port http://localhost:3001');
});