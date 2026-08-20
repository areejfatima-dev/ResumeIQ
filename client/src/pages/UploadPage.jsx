import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import axios from "axios";

// Same design tokens as LoginPage: bg #0B0F14, card #12181F, accent #5EEAD4, text #E7ECEF, muted #7C8A96

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Called when user drops or selects a file
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null);
    setResult(null);

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

  // Send file to backend
  async function handleAnalyze() {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const { data } = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(data);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Upload failed. Is the backend running on port 5000?";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  // Reset everything to upload a new file
  function handleReset() {
    setFile(null);
    setResult(null);
    setError(null);
  }

  return (
    <div style={styles.page}>
      {/* Ambient orbs — same as LoginPage */}
      <FloatingOrb size={420} color="#5EEAD433" top="-10%" left="-8%" duration={14} />
      <FloatingOrb size={320} color="#F5C45122" bottom="-12%" right="-6%" duration={18} />

      {/* Grid texture */}
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
          Drop a PDF and we'll extract & score it.
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
            }}
          >
            <input {...getInputProps()} />

            {file ? (
              <div style={styles.fileInfo}>
                <FileText size={20} color="#5EEAD4" />
                <span style={styles.fileName}>{file.name}</span>
                <span style={styles.fileSize}>
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            ) : (
              <div style={styles.dropPrompt}>
                <Upload size={28} color={isDragActive ? "#5EEAD4" : "#7C8A96"} />
                <p style={{ color: isDragActive ? "#5EEAD4" : "#7C8A96", fontSize: 14 }}>
                  {isDragActive
                    ? "Drop it here..."
                    : "Drag & drop your PDF here, or click to browse"}
                </p>
                <p style={{ color: "#556270", fontSize: 12 }}>Max 5 MB</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Analyze button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48, duration: 0.4 }}
          whileHover={file && !loading ? { scale: 1.015, boxShadow: "0 10px 30px -8px #5EEAD466" } : {}}
          whileTap={file && !loading ? { scale: 0.98 } : {}}
          onClick={handleAnalyze}
          disabled={!file || loading}
          style={{
            ...styles.analyzeBtn,
            opacity: !file || loading ? 0.5 : 1,
            cursor: !file || loading ? "default" : "pointer",
          }}
        >
          {loading ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                style={styles.spinner}
              />
              Analyzing...
            </>
          ) : (
            "Analyze Resume"
          )}
        </motion.button>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={styles.errorBox}
            >
              <AlertCircle size={16} color="#F87171" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={styles.resultSection}
            >
              <div style={styles.successHeader}>
                <CheckCircle2 size={18} color="#5EEAD4" />
                <span style={{ color: "#5EEAD4", fontWeight: 600, fontSize: 14 }}>
                  Extracted {result.textLength} characters from "{result.fileName}"
                </span>
              </div>

              <div style={styles.textBox}>
                <pre style={styles.extractedText}>{result.extractedText}</pre>
              </div>

              <button onClick={() => navigate("/dashboard")} style={styles.analyzeBtn}>
                View Full Analysis <ArrowRight size={16} />
              </button>

              <button onClick={handleReset} style={styles.resetBtn}>
                Upload another resume
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ---- Inline styles (matches LoginPage conventions) ----

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
    maxWidth: 480,
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
  },
  fileName: {
    color: "#E7ECEF",
    fontSize: 14,
    fontWeight: 500,
  },
  fileSize: {
    color: "#7C8A96",
    fontSize: 12,
  },
  analyzeBtn: {
    width: "100%",
    marginTop: 20,
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
  },
  errorBox: {
    marginTop: 16,
    padding: "12px 14px",
    borderRadius: 10,
    background: "#F8717115",
    border: "1px solid #F8717133",
    color: "#FCA5A5",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  resultSection: {
    marginTop: 20,
  },
  successHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  textBox: {
    background: "#0B0F14",
    border: "1px solid #22303A",
    borderRadius: 12,
    padding: 16,
    maxHeight: 260,
    overflowY: "auto",
  },
  extractedText: {
    color: "#9CA3AF",
    fontSize: 12,
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    margin: 0,
  },
  resetBtn: {
    marginTop: 14,
    padding: "10px 0",
    width: "100%",
    borderRadius: 10,
    border: "1px solid #22303A",
    background: "transparent",
    color: "#7C8A96",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 500,
  },
};

// Reuse same floating orb from LoginPage style
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
