const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Shape the user object for responses — never expose the password hash
const sanitize = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = await User.create({ name, email: normalizedEmail, password });
    const token = generateToken(user.id);
    res.status(201).json({ token, user: sanitize(user) });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors[0].message });
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });
    // Same message whether the email is missing or the password is wrong —
    // avoids leaking which emails are registered
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);
    res.json({ token, user: sanitize(user) });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  res.json({ user: sanitize(req.user) });
};

module.exports = { register, login, getMe };
