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
    validate: { len: { args: [0, 5000], msg: 'Description too long (max 5000 characters)' } },
  },
  cvText: {
    type: DataTypes.TEXT,
    allowNull: true, // uploaded existing CV, or the chosen working CV
    validate: { len: { args: [0, 50000], msg: 'CV too long (max 50000 characters)' } },
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
