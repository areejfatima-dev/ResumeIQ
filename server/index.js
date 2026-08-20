const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

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