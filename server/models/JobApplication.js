const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const JobApplication = sequelize.define('JobApplication', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: { msg: 'Company is required' } },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: { msg: 'Title is required' } },
  },
  jobUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('saved', 'applied', 'interview', 'offer', 'rejected'),
    allowNull: false,
    defaultValue: 'saved',
    validate: {
      // app-level check so a bad value is a clean 400, not a DB-level 500
      isIn: {
        args: [['saved', 'applied', 'interview', 'offer', 'rejected']],
        msg: 'Invalid status value',
      },
    },
  },
  appliedAt: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  interviewAt: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = JobApplication;
