# ResumeIQ

An AI-powered resume analyzer that scores your resume against a job description, highlights matched and missing keywords, and suggests concrete improvements — built to help job seekers beat ATS (Applicant Tracking System) filters.

## Why This Project

Most resumes get filtered out by ATS software before a human ever sees them. ResumeIQ solves a real, relatable problem: it parses your resume, compares it against a target job description, and gives you an actionable breakdown of how to improve your match score.

## Tech Stack

**Frontend**
- React (Vite)
- Framer Motion — animations and 3D tilt effects
- React Router — navigation
- Recharts — score and category charts
- React Dropzone — drag-and-drop resume upload
- Axios — API requests
- Lucide React — icons

**Backend**
- Node.js / Express
- Multer — file upload handling
- pdf-parse — PDF text extraction
- Groq / Gemini API — AI-powered resume analysis
- MongoDB (Mongoose) — score history storage

## Features

- 🔐 Animated login and signup pages
- 📄 Drag-and-drop PDF resume upload
- 🤖 AI-powered resume-to-job-description matching
- 📊 ATS score with visual breakdown (radial + bar charts)
- ✅ Matched keywords vs ❌ missing keywords
- 💡 AI-generated improvement suggestions
- 📈 Score history tracking (coming soon)
- 🔁 Before/after resume comparison (coming soon)

## Project Structure

```
ResumeIQ/
├── client/          # React frontend
│   └── src/
│       ├── pages/   # LoginPage, SignupPage, UploadPage, DashboardPage
│       └── App.jsx
└── server/          # Express backend
    └── index.js     # API routes (upload, analyze)
```

## Getting Started

### Prerequisites
- Node.js installed
- A Groq and/or Gemini API key

### Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```
PORT=5000
GROQ_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
MONGO_URI=your_mongodb_connection_string
```

Run the server:
```bash
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:5173`

## Status

🚧 Actively in development. Core upload + PDF parsing pipeline is working; AI analysis and dashboard are in progress.

## License

MIT