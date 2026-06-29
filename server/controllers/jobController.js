const { JobApplication } = require('../models');

// Only these fields can ever be set from the request body.
// Prevents mass-assignment of userId / id / timestamps.
const ALLOWED_FIELDS = [
  'company',
  'title',
  'jobUrl',
  'description',
  'status',
  'appliedAt',
  'interviewAt',
  'notes',
];

const pickAllowed = (body) => {
  const data = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  return data;
};

// POST /api/jobs
const createJob = async (req, res, next) => {
  try {
    const data = pickAllowed(req.body);
    if (!data.company || !data.title) {
      return res.status(400).json({ error: 'Company and title are required' });
    }
    const job = await JobApplication.create({ ...data, userId: req.user.id });
    res.status(201).json(job);
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors[0].message });
    }
    next(err);
  }
};

// GET /api/jobs — only the logged-in user's jobs
const getJobs = async (req, res, next) => {
  try {
    const jobs = await JobApplication.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json(jobs);
  } catch (err) {
    next(err);
  }
};

// GET /api/jobs/:id — scoped to the owner
const getJob = async (req, res, next) => {
  try {
    const job = await JobApplication.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    next(err);
  }
};

// PUT /api/jobs/:id
const updateJob = async (req, res, next) => {
  try {
    const job = await JobApplication.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    await job.update(pickAllowed(req.body));
    res.json(job);
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors[0].message });
    }
    next(err);
  }
};

// DELETE /api/jobs/:id
const deleteJob = async (req, res, next) => {
  try {
    const job = await JobApplication.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    await job.destroy();
    res.json({ message: 'Job deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createJob, getJobs, getJob, updateJob, deleteJob };
