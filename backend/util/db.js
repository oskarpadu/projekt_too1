const Sequelize = require('sequelize');

const sequelize = new Sequelize('EnergyDB', 'root', 'qwerty', {
    dialect: 'mysql',
    host: 'localhost',
});

module.exports = sequelize;