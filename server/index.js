require('dotenv').config(); // must be first — loads env before anything else reads it

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { sequelize } = require('./models'); // registry — loads all models before sync

const app = express();
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';

// Don't let an unexpected error kill the process silently — log it
process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason));
process.on('uncaughtException', (err) => console.error('[uncaughtException]', err));

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan(isDev ? 'dev' : 'combined')); // HTTP request logging

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/ai', require('./routes/ai'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Global error handler — catches any error passed via next(err)
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message);
  console.error(err.stack);
  // multer file-upload errors (size limit, bad type) are client errors
  if (err.name === 'MulterError' || err.status === 400) {
    return res.status(400).json({ error: err.message });
  }
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// DB connection + server start
sequelize.authenticate()
  .then(() => {
    console.log('Database connected');
    return sequelize.sync({ alter: isDev }); // alter only in dev — safe for production
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('DB connection failed:', err));
