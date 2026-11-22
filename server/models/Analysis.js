const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  fileName: {
    type: String,
  },
  jobDescription: {
    type: String,
    maxlength: 4000,
    set: (value) => (typeof value === 'string' ? value.slice(0, 4000) : value),
  },
  overallScore: {
    type: Number,
  },
  matchedKeywords: [{ type: String }],
  missingKeywords: [{ type: String }],
  categoryScores: [{
    category: { type: String },
    score: { type: Number },
    _id: false,
  }],
  suggestions: [{ type: String }],
  suggestedRoles: [{
    role: { type: String },
    matchReason: { type: String },
    _id: false,
  }],
  learningRecommendations: [{
    skill: { type: String },
    suggestion: { type: String },
    _id: false,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Analysis', analysisSchema);
