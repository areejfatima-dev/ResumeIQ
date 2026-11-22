const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Analysis = require('../models/Analysis');

const router = express.Router();

router.use(auth);

// --- List the current user's analyses, newest first (lightweight) ---
router.get('/', async (req, res) => {
  try {
    const analyses = await Analysis.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select('_id fileName overallScore createdAt');

    return res.json({ success: true, analyses });
  } catch (err) {
    console.error('Fetch analyses error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch analyses' });
  }
});

// --- Get one full analysis, only if it belongs to the current user ---
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid analysis id' });
    }

    const analysis = await Analysis.findOne({ _id: req.params.id, user: req.user.id });
    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    return res.json({ success: true, analysis });
  } catch (err) {
    console.error('Fetch analysis error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch analysis' });
  }
});

// --- Delete one analysis, only if it belongs to the current user ---
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid analysis id' });
    }

    const analysis = await Analysis.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    return res.json({ success: true, message: 'Analysis deleted' });
  } catch (err) {
    console.error('Delete analysis error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to delete analysis' });
  }
});

module.exports = router;
