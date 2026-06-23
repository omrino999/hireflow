const express = require('express');
const router = express.Router();

// AI features - coming in Day 5
router.post('/analyze', (req, res) => res.json({ message: 'ai endpoint - coming soon' }));

module.exports = router;
