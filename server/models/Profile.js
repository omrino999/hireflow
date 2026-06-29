const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true, // enforces one profile per user (1:1)
  },
  rawDescription: {
    type: DataTypes.TEXT,
    allowNull: true, // user's free-text self-description
  },
  cvText: {
    type: DataTypes.TEXT,
    allowNull: true, // uploaded existing CV, or the chosen working CV
  },
  generatedCv: {
    type: DataTypes.TEXT,
    allowNull: true, // AI-generated CV, kept separate from the user's original
  },
  careerPaths: {
    type: DataTypes.JSON,
    allowNull: true, // AI career-path analysis result
  },
});

module.exports = Profile;
