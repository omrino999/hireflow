const { sequelize } = require('../config/database');
const User = require('./User');

// Central model registry. As we add models (Profile, JobApplication),
// we require them here and define their associations below.
const db = {
  sequelize,
  User,
};

// Associations go here, e.g.:
// db.User.hasOne(db.Profile, { foreignKey: 'userId', onDelete: 'CASCADE' });

module.exports = db;
