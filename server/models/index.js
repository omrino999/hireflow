const { sequelize } = require('../config/database');
const User = require('./User');
const JobApplication = require('./JobApplication');

// Central model registry. As we add models (Profile, etc.),
// we require them here and define their associations below.
const db = {
  sequelize,
  User,
  JobApplication,
};

// Associations
// A user has many job applications; deleting a user deletes their jobs.
db.User.hasMany(db.JobApplication, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.JobApplication.belongsTo(db.User, { foreignKey: 'userId' });

module.exports = db;
