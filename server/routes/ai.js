const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  generateCv,
  careerPaths,
  fitAnalysis,
  tailorCv,
  interviewPrep,
  improveCv,
} = require('../controllers/aiController');

// All AI routes require login
router.use(authMiddleware);

// Cost protection: cap AI calls per user/IP. Each call spends API credits.
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,                  // 30 AI calls per hour
  message: { error: 'AI usage limit reached, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
router.use(aiLimiter);

router.post('/generate-cv', generateCv);
router.post('/improve-cv', improveCv);
router.post('/career-paths', careerPaths);
router.post('/fit-analysis/:jobId', fitAnalysis);
router.post('/tailor-cv/:jobId', tailorCv);
router.post('/interview-prep/:jobId', interviewPrep);

module.exports = router;
