const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- Multer setup: memory storage, PDF only, max 5MB ---
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// --- Upload & extract text from a resume PDF ---
app.post('/api/upload', upload.single('resume'), async (req, res) => {
  try {
    // No file provided
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    // Parse the PDF buffer
    console.log('DEBUG buffer length:', req.file.buffer.length, 'head:', JSON.stringify(req.file.buffer.slice(0, 20).toString('latin1')));
    const data = await pdfParse(req.file.buffer);

    return res.json({
      success: true,
      fileName: req.file.originalname,
      textLength: data.text.length,
      extractedText: data.text,
    });
  } catch (err) {
    console.error('Upload error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to process PDF' });
  }
});

// --- AI analysis: resume vs job description via Groq ---
app.post('/api/analyze', async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Both resumeText and jobDescription are required',
      });
    }

    const prompt = `You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume against the job description and return a JSON response ONLY (no markdown, no extra text) with this exact structure:

{
  "overallScore": <number 0-100>,
  "matchedKeywords": ["keyword1", "keyword2", ...],
  "missingKeywords": ["keyword1", "keyword2", ...],
  "categoryScores": [
    { "category": "Technical Skills", "score": <0-100> },
    { "category": "Experience", "score": <0-100> },
    { "category": "Keywords Match", "score": <0-100> },
    { "category": "Formatting", "score": <0-100> }
  ],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "suggestedRoles": [
    { "role": "Job Title", "matchReason": "One short sentence on why this role fits." }
  ],
  "learningRecommendations": [
    { "skill": "Skill Name", "suggestion": "What kind of learning would help." }
  ]
}

Rules:
- overallScore: how well the resume matches the job (0 = no match, 100 = perfect)
- matchedKeywords: important keywords/terms from the job description found in the resume (5-12 items)
- missingKeywords: important keywords/terms from the job description NOT found in the resume (3-8 items)
- categoryScores: score each category 0-100
- suggestions: 3-5 concrete, actionable improvements the candidate should make
- suggestedRoles: 2-3 job titles that fit the resume's skills, each with a one-sentence matchReason
- learningRecommendations: 3-4 items, one per important missing keyword, each describing what kind of learning would help. Do NOT include URLs or specific course names.

Resume:
---
${resumeText.slice(0, 8000)}
---

Job Description:
---
${jobDescription.slice(0, 4000)}
---`;

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 2200,
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) {
      return res.status(500).json({ success: false, message: 'Empty response from AI' });
    }

    // Parse AI response safely (try direct JSON parse, then regex extraction fallback)
    let analysis;
    try {
      analysis = JSON.parse(raw);
    } catch {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          analysis = JSON.parse(jsonMatch[0]);
        } catch (parseErr) {
          console.error('Failed to parse AI response with regex fallback:', parseErr);
          return res.status(500).json({ success: false, message: 'Malformed AI response format' });
        }
      } else {
        console.error('Failed to parse AI response:', raw);
        return res.status(500).json({ success: false, message: 'Malformed AI response format' });
      }
    }

    // Validate required fields
    const hasValidFields =
      typeof analysis.overallScore === 'number' &&
      Array.isArray(analysis.matchedKeywords) &&
      Array.isArray(analysis.missingKeywords) &&
      Array.isArray(analysis.categoryScores) &&
      Array.isArray(analysis.suggestions) &&
      Array.isArray(analysis.suggestedRoles) &&
      Array.isArray(analysis.learningRecommendations);

    if (!hasValidFields) {
      console.error('AI response failed schema validation:', analysis);
      return res.status(500).json({ success: false, message: 'AI response missing required analysis fields' });
    }

    return res.json({ success: true, analysis });
  } catch (err) {
    console.error('Analyze error:', err.message || err);
    return res.status(500).json({ success: false, message: 'Analysis failed: ' + (err.message || 'Unknown error') });
  }
});

// --- Handle multer errors (wrong type, too large) ---
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Max size is 5MB' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));