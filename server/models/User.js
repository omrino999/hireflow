const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: { msg: 'Name cannot be empty' } },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: { msg: 'Must be a valid email' } },
    set(value) {
      // normalize so Omri@Test.com and omri@test.com are the same account
      this.setDataValue('email', String(value).trim().toLowerCase());
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    // validation runs on the RAW password (before the beforeCreate hash hook)
    validate: { len: { args: [6, 100], msg: 'Password must be at least 6 characters' } },
  },
});

// Hash password before insert
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

// Re-hash only if password actually changed on update
User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

// Compare a plaintext candidate against the stored hash
User.prototype.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = User;
