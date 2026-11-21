import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, AlertCircle, ArrowRight } from "lucide-react";
import axios from "axios";

const API = "http://localhost:5000";

// The server slices jobDescription to 4000 chars before building the prompt,
// so warn once the pasted text exceeds that — the tail is silently dropped.
const JD_MAX = 4000;

const LOADING_LABEL = {
  extracting: "Extracting resume text...",
  analyzing: "Analyzing against job description...",
};

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading
  const [stage, setStage] = useState("extracting"); // extracting | analyzing
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState(null);

  const isLoading = status === "loading";
  const hasJobDescription = jobDescription.trim().length > 0;
  const canAnalyze = Boolean(file) && hasJobDescription && !isLoading;
  const overLimit = jobDescription.length > JD_MAX;

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null);

    if (rejectedFiles.length > 0) {
      setError("Only PDF files are allowed (max 5MB).");
      return;
    }

    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  function handleRemoveFile() {
    setFile(null);
    setError(null);
  }

  // Upload to extract text, then analyze — both in one click.
  async function handleAnalyze() {
    if (!file || !hasJobDescription) return;

    setStatus("loading");
    setStage("extracting");
    setError(null);

    // Local flag so the catch block knows which call actually failed.
    let phase = "extracting";

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const { data: uploadData } = await axios.post(`${API}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!uploadData.success) {
        throw new Error(uploadData.message || "Upload failed");
      }

      const resumeText = uploadData.extractedText;

      if (!resumeText || !resumeText.trim()) {
        throw new Error("No readable text found — the PDF may be a scan or an image.");
      }

      phase = "analyzing";
      setStage("analyzing");

      const { data: analyzeData } = await axios.post(`${API}/api/analyze`, {
        resumeText,
        jobDescription: jobDescription.trim(),
      });

      if (!analyzeData.success) {
        throw new Error(analyzeData.message || "Analysis failed");
      }

      navigate("/dashboard", {
        state: {
          analysis: analyzeData.analysis,
          fileName: file.name,
        },
      });
    } catch (err) {
      // No response at all means the request never reached the server.
      const detail = err.response?.data?.message || (err.response ? err.message : null);

      setError(
        phase === "extracting"
          ? `Failed to extract text from PDF${detail ? `: ${detail}` : ". Is the backend running on port 5000?"}`
          : `AI analysis failed, please try again${detail ? `: ${detail}` : "."}`
      );
      setStatus("idle");
    }
  }

  return (
    <div style={styles.page}>
      <FloatingOrb size={420} color="#5EEAD433" top="-10%" left="-8%" duration={14} />
      <FloatingOrb size={320} color="#F5C45122" bottom="-12%" right="-6%" duration={18} />
      <div style={styles.grid} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={styles.card}
      >
        {/* Header icon */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 14 }}
          style={styles.iconBadge}
        >
          <Upload size={26} color="#0B0F14" strokeWidth={2.4} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          style={styles.title}
        >
          Analyze your resume
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.32, duration: 0.5 }}
          style={styles.subtitle}
        >
          Drop your PDF and paste a job description to get an ATS match score.
        </motion.p>

        {/* Drop zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <div
            {...getRootProps()}
            style={{
              ...styles.dropzone,
              borderColor: isDragActive ? "#5EEAD4" : file ? "#2DD4BF44" : "#22303A",
              background: isDragActive ? "#5EEAD40d" : "#0B0F14",
              opacity: isLoading ? 0.6 : 1,
              pointerEvents: isLoading ? "none" : "auto",
            }}
          >
            <input {...getInputProps()} />
            {file ? (
              <div style={styles.fileInfo}>
                <FileText size={20} color="#5EEAD4" />
                <span style={styles.fileName}>{file.name}</span>
                <span style={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      e.preventDefault();
                      handleRemoveFile();
                    }
                  }}
                  style={styles.removeFile}
                >
                  Remove
                </span>
              </div>
            ) : (
              <div style={styles.dropPrompt}>
                <Upload size={28} color={isDragActive ? "#5EEAD4" : "#7C8A96"} />
                <p style={{ color: isDragActive ? "#5EEAD4" : "#7C8A96", fontSize: 14 }}>
                  {isDragActive ? "Drop it here..." : "Drag & drop your PDF here, or click to browse"}
                </p>
                <p style={{ color: "#556270", fontSize: 12 }}>Max 5 MB</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Job description textarea */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48, duration: 0.4 }}
          style={{ marginTop: 16 }}
        >
          <div style={styles.labelRow}>
            <label htmlFor="job-description" style={styles.label}>
              Job Description
            </label>
            <span style={overLimit ? styles.counterOver : styles.counter}>
              {jobDescription.length.toLocaleString()}
              {overLimit ? ` / ${JD_MAX.toLocaleString()} — extra text will be ignored` : " characters"}
            </span>
          </div>
          <textarea
            id="job-description"
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={isLoading}
            style={{
              ...styles.textarea,
              borderColor: focused ? "#5EEAD4" : "#22303A",
              opacity: isLoading ? 0.6 : 1,
            }}
          />
        </motion.div>

        {/* Action button — one click covers both API calls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.54, duration: 0.4 }}
          style={{ marginTop: 18 }}
        >
          <motion.button
            whileHover={canAnalyze ? { scale: 1.015, boxShadow: "0 10px 30px -8px #5EEAD466" } : {}}
            whileTap={canAnalyze ? { scale: 0.98 } : {}}
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            style={{
              ...styles.primaryBtn,
              opacity: canAnalyze ? 1 : 0.5,
              cursor: canAnalyze ? "pointer" : "default",
            }}
          >
            {isLoading ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  style={styles.spinner}
                />
                {LOADING_LABEL[stage]}
              </>
            ) : (
              <>
                Analyze Resume <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={styles.errorBox}
            >
              <AlertCircle size={16} color="#F87171" style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ---- Styles ----

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background: "#0B0F14",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
    padding: "24px",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(#ffffff08 1px, transparent 1px), linear-gradient(90deg, #ffffff08 1px, transparent 1px)",
    backgroundSize: "48px 48px",
    maskImage: "radial-gradient(circle at 50% 40%, black, transparent 75%)",
  },
  card: {
    position: "relative",
    width: "100%",
    maxWidth: 520,
    borderRadius: 20,
    padding: "40px 36px",
    background: "linear-gradient(160deg, #12181F 0%, #0E1319 100%)",
    border: "1px solid #22303A",
    boxShadow: "0 30px 80px -20px #000000aa, 0 0 0 1px #ffffff05",
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: "linear-gradient(135deg, #5EEAD4, #2DD4BF)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px -6px #5EEAD466",
    marginBottom: 22,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: "#E7ECEF",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    color: "#7C8A96",
    fontSize: 14,
    marginBottom: 28,
  },
  dropzone: {
    border: "2px dashed",
    borderRadius: 14,
    padding: "32px 20px",
    textAlign: "center",
    cursor: "pointer",
    transition: "border-color 0.2s, background 0.2s",
  },
  dropPrompt: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  fileName: { color: "#E7ECEF", fontSize: 14, fontWeight: 500 },
  fileSize: { color: "#7C8A96", fontSize: 12 },
  removeFile: {
    color: "#F87171",
    fontSize: 12,
    fontWeight: 500,
    padding: "3px 9px",
    borderRadius: 8,
    border: "1px solid #F8717133",
    background: "#F8717112",
    cursor: "pointer",
    transition: "background 0.2s, border-color 0.2s",
  },
  labelRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
  },
  label: {
    color: "#7C8A96",
    fontSize: 13,
    fontWeight: 500,
  },
  counter: {
    color: "#556270",
    fontSize: 12,
    fontVariantNumeric: "tabular-nums",
  },
  counterOver: {
    color: "#F5C451",
    fontSize: 12,
    fontVariantNumeric: "tabular-nums",
    textAlign: "right",
  },
  textarea: {
    width: "100%",
    minHeight: 120,
    padding: "14px",
    borderRadius: 12,
    border: "1px solid #22303A",
    background: "#0B0F14",
    color: "#E7ECEF",
    fontSize: 13,
    lineHeight: 1.6,
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    resize: "vertical",
    outline: "none",
    transition: "border-color 0.2s, opacity 0.2s",
  },
  primaryBtn: {
    width: "100%",
    padding: "13px 0",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #5EEAD4, #2DD4BF)",
    color: "#0B0F14",
    fontWeight: 600,
    fontSize: 15,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  spinner: {
    width: 16,
    height: 16,
    border: "2px solid #0B0F1440",
    borderTopColor: "#0B0F14",
    borderRadius: "50%",
    display: "inline-block",
    flexShrink: 0,
  },
  errorBox: {
    marginTop: 16,
    padding: "12px 14px",
    borderRadius: 10,
    background: "#F8717115",
    border: "1px solid #F8717133",
    color: "#FCA5A5",
    fontSize: 13,
    lineHeight: 1.5,
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
  },
};

function FloatingOrb({ size, color, top, left, right, bottom, duration }) {
  return (
    <motion.div
      animate={{ y: [0, -24, 0], x: [0, 14, 0] }}
      transition={{ repeat: Infinity, duration, ease: "easeInOut" }}
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        filter: "blur(60px)",
        top,
        left,
        right,
        bottom,
        pointerEvents: "none",
      }}
    />
  );
}