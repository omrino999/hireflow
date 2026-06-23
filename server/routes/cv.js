const express = require('express');
const router = express.Router();

// CV upload and management - coming in Day 5
router.get('/', (req, res) => res.json({ message: 'cv endpoint - coming soon' }));

module.exports = router;
