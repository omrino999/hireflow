const { sequelize } = require('../config/database');
const User = require('./User');
const JobApplication = require('./JobApplication');
const Profile = require('./Profile');

// Central model registry.
const db = {
  sequelize,
  User,
  JobApplication,
  Profile,
};

// Associations
// A user has many job applications; deleting a user deletes their jobs.
db.User.hasMany(db.JobApplication, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.JobApplication.belongsTo(db.User, { foreignKey: 'userId' });

// A user has one profile (the sensitive PII table); deleting a user deletes it.
db.User.hasOne(db.Profile, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.Profile.belongsTo(db.User, { foreignKey: 'userId' });

module.exports = db;
