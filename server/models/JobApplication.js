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
    validate: { len: { args: [0, 15000], msg: 'Job description too long (max 15000 characters)' } },
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
    validate: { len: { args: [0, 2000], msg: 'Notes too long (max 2000 characters)' } },
  },
  // --- AI result fields (written by the AI layer only, never the client) ---
  fitScore: {
    type: DataTypes.INTEGER, // 0-100 match score (own column so we can sort by it)
    allowNull: true,
  },
  fitAnalysis: {
    type: DataTypes.JSON, // full AI fit result: { score, summary, strengths, gaps }
    allowNull: true,
  },
  tailoredCv: {
    type: DataTypes.TEXT, // AI-tailored CV for this specific job
    allowNull: true,
  },
  interviewQuestions: {
    type: DataTypes.JSON, // AI-generated Q&A array for this job
    allowNull: true,
  },
});

module.exports = JobApplication;
