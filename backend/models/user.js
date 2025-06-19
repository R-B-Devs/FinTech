const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // your Sequelize instance

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: DataTypes.STRING,
  password: DataTypes.STRING,
  idNumber: DataTypes.STRING,
  // other fields
});

module.exports = User;
