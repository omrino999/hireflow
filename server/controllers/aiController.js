const { Profile, JobApplication } = require('../models');
const ai = require('../services/aiService');

// Get the user's profile or null
const getProfile = (userId) => Profile.findOne({ where: { userId } });

// Get a job owned by the user, or null
const getOwnedJob = (jobId, userId) =>
  JobApplication.findOne({ where: { id: jobId, userId } });

// The CV text we feed the AI: prefer uploaded CV, then generated, then description
const resolveCvText = (profile) =>
  profile && (profile.cvText || profile.generatedCv || profile.rawDescription);

// Wrap an AI call so SDK/network errors become a clean 502 instead of a 500
const runAI = async (res, next, fn) => {
  try {
    return await fn();
  } catch (err) {
    console.error('AI call failed:', err.message);
    res.status(502).json({ error: 'AI service error, please try again' });
    return null;
  }
};

// POST /api/ai/generate-cv
const generateCv = async (req, res, next) => {
  try {
    const profile = await getProfile(req.user.id);
    const description = (profile && profile.rawDescription) || req.body.description;
    if (!description) {
      return res.status(400).json({ error: 'A self-description is required first' });
    }

    const cv = await runAI(res, next, () => ai.generateCv(description));
    if (cv === null) return;

    const saved = profile
      ? await profile.update({ generatedCv: cv })
      : await Profile.create({ userId: req.user.id, rawDescription: description, generatedCv: cv });

    res.json({ generatedCv: saved.generatedCv });
  } catch (err) {
    next(err);
  }
};

// POST /api/ai/career-paths
const careerPaths = async (req, res, next) => {
  try {
    const profile = await getProfile(req.user.id);
    const profileText = resolveCvText(profile);
    if (!profileText) {
      return res.status(400).json({ error: 'Add a CV or description first' });
    }

    const result = await runAI(res, next, () => ai.careerPaths(profileText));
    if (result === null) return;

    await profile.update({ careerPaths: result });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// POST /api/ai/fit-analysis/:jobId
const fitAnalysis = async (req, res, next) => {
  try {
    const profile = await getProfile(req.user.id);
    const cvText = resolveCvText(profile);
    if (!cvText) return res.status(400).json({ error: 'Add a CV or description first' });

    const job = await getOwnedJob(req.params.jobId, req.user.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (!job.description) {
      return res.status(400).json({ error: 'This job has no description to analyze' });
    }

    const result = await runAI(res, next, () => ai.fitAnalysis(cvText, job.description));
    if (result === null) return;

    // store the full result so strengths/gaps survive a reload, plus score on its own column
    await job.update({ fitScore: result.score, fitAnalysis: result });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// POST /api/ai/tailor-cv/:jobId
const tailorCv = async (req, res, next) => {
  try {
    const profile = await getProfile(req.user.id);
    const cvText = resolveCvText(profile);
    if (!cvText) return res.status(400).json({ error: 'Add a CV or description first' });

    const job = await getOwnedJob(req.params.jobId, req.user.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (!job.description) {
      return res.status(400).json({ error: 'This job has no description to tailor against' });
    }

    const tailored = await runAI(res, next, () => ai.tailorCv(cvText, job.description));
    if (tailored === null) return;

    await job.update({ tailoredCv: tailored });
    res.json({ tailoredCv: tailored });
  } catch (err) {
    next(err);
  }
};

// POST /api/ai/interview-prep/:jobId
const interviewPrep = async (req, res, next) => {
  try {
    const profile = await getProfile(req.user.id);
    const cvText = resolveCvText(profile); // optional for interview prep

    const job = await getOwnedJob(req.params.jobId, req.user.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (!job.description) {
      return res.status(400).json({ error: 'This job has no description for interview prep' });
    }

    const result = await runAI(res, next, () => ai.interviewPrep(job.description, cvText));
    if (result === null) return;

    await job.update({ interviewQuestions: result.questions });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// POST /api/ai/improve-cv
const improveCv = async (req, res, next) => {
  try {
    const profile = await getProfile(req.user.id);
    const cvText = resolveCvText(profile);
    if (!cvText) return res.status(400).json({ error: 'Add or upload a CV first' });

    const suggestions = await runAI(res, next, () => ai.improveCv(cvText));
    if (suggestions === null) return;

    res.json({ suggestions });
  } catch (err) {
    next(err);
  }
};

module.exports = { generateCv, careerPaths, fitAnalysis, tailorCv, interviewPrep, improveCv };
