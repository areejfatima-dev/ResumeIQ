import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowLeft,
  ArrowRight,
  FileText,
  FileSearch,
  Briefcase,
  GraduationCap,
} from "lucide-react";

// ---- Helpers ----

function scoreColor(score) {
  if (score >= 75) return "#5EEAD4";
  if (score >= 50) return "#F5C451";
  return "#F87171";
}

// The AI can hand back a score as a string ("82"), null, or out of range.
// Recharts needs a real finite number on a numeric axis, otherwise the bar
// geometry collapses and the bar silently renders at zero width.
function clampScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

function normalizeCategoryScores(value) {
  if (!Array.isArray(value)) return [];
  return value.map((row) => ({
    category: String(row?.category ?? "Unknown"),
    score: clampScore(row?.score),
  }));
}

function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = null;
    const from = 0;
    const to = value;

    function tick(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [value, duration]);

  return <span>{display}</span>;
}

// ---- Main component ----

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Real analysis data, handed over by UploadPage via router state.
  const analysis = location.state?.analysis;
  const fileName = location.state?.fileName;

  // Direct visit / refresh on /dashboard: there is nothing to render.
  if (!analysis) {
    return (
      <div style={styles.page}>
        <div style={styles.grid} />
        <FloatingOrb size={420} color="#5EEAD422" top="-12%" right="-8%" duration={16} />
        <FloatingOrb size={280} color="#F5C45118" bottom="-10%" left="-5%" duration={20} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={styles.emptyCard}
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 14 }}
            style={styles.emptyIconBadge}
          >
            <FileSearch size={26} color="#0B0F14" strokeWidth={2.4} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            style={styles.pageTitle}
          >
            No analysis yet
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.32, duration: 0.5 }}
            style={styles.emptyText}
          >
            Upload a resume to get started — we'll score it against a job description and
            show you what to improve.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <motion.button
              whileHover={{ scale: 1.015, boxShadow: "0 10px 30px -8px #5EEAD466" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/upload")}
              style={styles.emptyBtn}
            >
              Upload a resume <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const color = scoreColor(analysis.overallScore);

  // Recharts radial data — single bar for the score
  const radialData = [{ name: "Score", value: analysis.overallScore, fill: color }];

  // Category bar chart colors
  const barColors = ["#5EEAD4", "#2DD4BF", "#5EEAD4", "#2DD4BF"];

  // DEBUG (temporary): remove once the chart is confirmed rendering real data
  console.log("[Dashboard] categoryScores =", analysis.categoryScores);
  console.log(
    "[Dashboard] score types =",
    analysis.categoryScores?.map((c) => typeof c?.score)
  );

  const categoryScores = normalizeCategoryScores(analysis.categoryScores);

  return (
    <div style={styles.page}>
      {/* Background elements */}
      <div style={styles.grid} />
      <FloatingOrb size={420} color="#5EEAD422" top="-12%" right="-8%" duration={16} />
      <FloatingOrb size={280} color="#F5C45118" bottom="-10%" left="-5%" duration={20} />

      <div style={styles.container}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={styles.header}
        >
          <button onClick={() => navigate("/upload")} style={styles.backBtn}>
            <ArrowLeft size={16} />
            Back
          </button>
          <div>
            <h1 style={styles.pageTitle}>Your Resume Analysis</h1>
            <p style={styles.pageSubtitle}>
              <FileText size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
              {fileName}
            </p>
          </div>
        </motion.div>

        {/* Top row: Score + Category chart */}
        <div style={styles.topRow}>
          {/* Overall score — RadialBarChart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={{ ...styles.card, flex: "1 1 340px", minWidth: 0 }}
          >
            <h3 style={styles.cardTitle}>Overall Score</h3>
            <div style={styles.scoreWrap}>
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="65%"
                  outerRadius="90%"
                  barSize={14}
                  data={radialData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={7}
                    background={{ fill: "#1A222B" }}
                    isAnimationActive={true}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              {/* Score number overlay */}
              <div style={styles.scoreCenter}>
                <span style={{ ...styles.scoreNumber, color }}>
                  <AnimatedNumber value={analysis.overallScore} />
                </span>
                <span style={styles.scoreLabel}>/ 100</span>
              </div>
            </div>
          </motion.div>

          {/* Category breakdown — BarChart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ ...styles.card, flex: "1 1 340px", minWidth: 0 }}
          >
            <h3 style={styles.cardTitle}>Category Breakdown</h3>
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={categoryScores}
                  layout="vertical"
                  margin={{ left: 10, right: 20, top: 0, bottom: 0 }}
                >
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis
                    type="category"
                    dataKey="category"
                    width={120}
                    tick={{ fill: "#7C8A96", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#ffffff08" }}
                    contentStyle={styles.tooltip}
                    formatter={(val) => [`${val}/100`, "Score"]}
                  />
                  <Bar
                    dataKey="score"
                    radius={[0, 6, 6, 0]}
                    barSize={18}
                    isAnimationActive={true}
                    animationDuration={1000}
                  >
                    {categoryScores.map((entry, i) => (
                      <Cell key={i} fill={barColors[i % barColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Keywords row */}
        <div style={styles.keywordsRow}>
          {/* Matched */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{ ...styles.card, flex: 1.2 }}
          >
            <h3 style={{ ...styles.cardTitle, color: "#5EEAD4" }}>
              <CheckCircle2 size={16} style={{ marginRight: 6, verticalAlign: -2 }} />
              Matched Keywords ({analysis.matchedKeywords.length})
            </h3>
            <div style={styles.chipWrap}>
              {analysis.matchedKeywords.map((kw, i) => (
                <motion.span
                  key={`${kw}-${i}`}
                  initial={{ opacity: 0, scale: 0.8, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.06, duration: 0.3 }}
                  style={styles.chipMatched}
                >
                  <CheckCircle2 size={12} />
                  {kw}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Missing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            style={{ ...styles.card, flex: 0.8 }}
          >
            <h3 style={{ ...styles.cardTitle, color: "#F87171" }}>
              <AlertTriangle size={16} style={{ marginRight: 6, verticalAlign: -2 }} />
              Missing Keywords ({analysis.missingKeywords.length})
            </h3>
            <div style={styles.chipWrap}>
              {analysis.missingKeywords.map((kw, i) => (
                <motion.span
                  key={`${kw}-${i}`}
                  initial={{ opacity: 0, scale: 0.8, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.45 + i * 0.06, duration: 0.3 }}
                  style={styles.chipMissing}
                >
                  <AlertTriangle size={12} />
                  {kw}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={styles.card}
        >
          <h3 style={styles.cardTitle}>
            <Lightbulb size={16} style={{ marginRight: 6, verticalAlign: -2, color: "#F5C451" }} />
            Improvement Suggestions
          </h3>
          <div style={styles.suggestionList}>
            {analysis.suggestions.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.08, duration: 0.4 }}
                style={styles.suggestionRow}
              >
                <span style={styles.suggestionNum}>{i + 1}</span>
                <span style={styles.suggestionText}>{tip}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Suggested Career Roles */}
        {Array.isArray(analysis.suggestedRoles) && analysis.suggestedRoles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.58, duration: 0.5 }}
            style={styles.card}
          >
            <h3 style={styles.cardTitle}>
              <Briefcase size={16} style={{ marginRight: 6, verticalAlign: -2, color: "#5EEAD4" }} />
              Suggested Career Roles
            </h3>
            <div style={styles.rolesGrid}>
              {analysis.suggestedRoles.map((item, i) => (
                <motion.div
                  key={`${item?.role ?? "role"}-${i}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.66 + i * 0.08, duration: 0.35 }}
                  style={styles.roleCard}
                >
                  <div style={styles.roleTitle}>{item?.role}</div>
                  <div style={styles.roleReason}>{item?.matchReason}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Learning Recommendations */}
        {Array.isArray(analysis.learningRecommendations) && analysis.learningRecommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.66, duration: 0.5 }}
            style={styles.card}
          >
            <h3 style={styles.cardTitle}>
              <GraduationCap size={16} style={{ marginRight: 6, verticalAlign: -2, color: "#F5C451" }} />
              Learning Recommendations
            </h3>
            <div style={styles.suggestionList}>
              {analysis.learningRecommendations.map((item, i) => (
                <motion.div
                  key={`${item?.skill ?? "skill"}-${i}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.74 + i * 0.08, duration: 0.4 }}
                  style={styles.suggestionRow}
                >
                  <span style={{ ...styles.suggestionNum, background: "#5EEAD418", color: "#5EEAD4" }}>{i + 1}</span>
                  <div style={styles.learningContent}>
                    <span style={styles.skillTag}>{item?.skill}</span>
                    <span style={styles.suggestionText}>{item?.suggestion}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ---- Styles ----

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background: "#0B0F14",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
    padding: "96px 24px 60px 24px",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(#ffffff08 1px, transparent 1px), linear-gradient(90deg, #ffffff08 1px, transparent 1px)",
    backgroundSize: "48px 48px",
    maskImage: "radial-gradient(circle at 50% 40%, black, transparent 75%)",
    pointerEvents: "none",
  },
  container: {
    position: "relative",
    maxWidth: 1060,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 4,
  },
  backBtn: {
    marginTop: 4,
    padding: "8px 14px",
    borderRadius: 10,
    border: "1px solid #22303A",
    background: "#12181F",
    color: "#7C8A96",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: "#E7ECEF",
    letterSpacing: "-0.02em",
    margin: 0,
  },
  pageSubtitle: {
    color: "#7C8A96",
    fontSize: 14,
    marginTop: 4,
  },
  emptyCard: {
    position: "relative",
    width: "100%",
    maxWidth: 460,
    margin: "12vh auto 0",
    borderRadius: 20,
    padding: "40px 36px",
    textAlign: "center",
    background: "linear-gradient(160deg, #12181F 0%, #0E1319 100%)",
    border: "1px solid #22303A",
    boxShadow: "0 30px 80px -20px #000000aa, 0 0 0 1px #ffffff05",
  },
  emptyIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: "linear-gradient(135deg, #5EEAD4, #2DD4BF)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px -6px #5EEAD466",
    margin: "0 auto 22px",
  },
  emptyText: {
    color: "#7C8A96",
    fontSize: 14,
    lineHeight: 1.6,
    marginTop: 10,
  },
  emptyBtn: {
    width: "100%",
    marginTop: 22,
    padding: "13px 0",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #5EEAD4, #2DD4BF)",
    color: "#0B0F14",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  topRow: {
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
  },
  card: {
    background: "linear-gradient(160deg, #12181F 0%, #0E1319 100%)",
    border: "1px solid #22303A",
    borderRadius: 16,
    padding: "24px 28px",
    boxShadow: "0 12px 40px -12px #00000088",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#E7ECEF",
    margin: "0 0 16px",
    display: "flex",
    alignItems: "center",
  },
  scoreWrap: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
  },
  scoreCenter: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
  },
  scoreNumber: {
    fontSize: 42,
    fontWeight: 700,
    letterSpacing: "-0.03em",
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: 13,
    color: "#7C8A96",
    display: "block",
    marginTop: 2,
  },
  tooltip: {
    background: "#1A222B",
    border: "1px solid #22303A",
    borderRadius: 10,
    color: "#E7ECEF",
    fontSize: 12,
  },
  keywordsRow: {
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
  },
  chipWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  chipMatched: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 500,
    color: "#5EEAD4",
    background: "#5EEAD412",
    border: "1px solid #5EEAD422",
  },
  chipMissing: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 500,
    color: "#F87171",
    background: "#F8717112",
    border: "1px solid #F8717122",
  },
  suggestionList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  suggestionRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "12px 14px",
    borderRadius: 10,
    background: "#0B0F14",
    border: "1px solid #1A222B",
  },
  suggestionNum: {
    width: 22,
    height: 22,
    borderRadius: 7,
    background: "#F5C45118",
    color: "#F5C451",
    fontSize: 11,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  suggestionText: {
    color: "#9CA3AF",
    fontSize: 13,
    lineHeight: 1.5,
  },
  rolesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  roleCard: {
    padding: "14px 16px",
    borderRadius: 12,
    background: "#0B0F14",
    border: "1px solid #1A222B",
  },
  roleTitle: {
    color: "#E7ECEF",
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 6,
  },
  roleReason: {
    color: "#7C8A96",
    fontSize: 12,
    lineHeight: 1.5,
  },
  learningContent: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minWidth: 0,
  },
  skillTag: {
    display: "inline-flex",
    alignSelf: "flex-start",
    padding: "3px 8px",
    borderRadius: 7,
    fontSize: 11,
    fontWeight: 600,
    color: "#5EEAD4",
    background: "#5EEAD412",
    border: "1px solid #5EEAD422",
  },
};

// ---- Floating orb (same as other pages) ----

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
