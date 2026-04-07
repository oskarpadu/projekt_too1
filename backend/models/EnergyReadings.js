const Sequelize = require('sequelize');
const sequelize = require('../util/db');

const EnergyReadings = sequelize.define('EnergyReadings', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    location: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    price_eur_mwh: {
        type: Sequelize.FLOAT,
        allowNull: true,
    },
    source: {
        type: Sequelize.ENUM('Upload', 'API'),
        allowNull: false,
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
    },
});

module.exports = EnergyReadings;