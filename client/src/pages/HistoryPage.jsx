import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  ArrowRight,
  FileText,
  History,
  Layers,
  RefreshCw,
  Trash2,
  TrendingUp,
  Trophy,
} from "lucide-react";
import api from "../api";

// ---- Helpers ----

function scoreColor(score) {
  if (score >= 75) return "#5EEAD4";
  if (score >= 50) return "#F5C451";
  return "#F87171";
}

function clampScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

function timeOf(value) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function formatDate(value) {
  if (!timeOf(value)) return "Unknown date";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(value) {
  if (!timeOf(value)) return "Unknown";
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// ---- Small pieces ----

function Spinner() {
  return (
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      style={styles.spinner}
    />
  );
}

function TrendTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;

  return (
    <div style={styles.tooltip}>
      <div style={styles.tooltipName}>{item.fileName}</div>
      <div style={styles.tooltipRow}>
        <span style={styles.tooltipLabel}>Score</span>
        <span style={{ color: scoreColor(item.score), fontWeight: 700 }}>{item.score}/100</span>
      </div>
      <div style={styles.tooltipRow}>
        <span style={styles.tooltipLabel}>Date</span>
        <span>{formatDate(item.createdAt)}</span>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      style={styles.statCard}
    >
      <div style={styles.statTop}>
        <span style={{ color, display: "flex" }}>{icon}</span>
        <span style={styles.statLabel}>{label}</span>
      </div>
      <div style={{ ...styles.statValue, color }}>{value}</div>
    </motion.div>
  );
}

function HistoryItem({
  item,
  index,
  viewing,
  deleting,
  confirming,
  onView,
  onToggleConfirm,
  onDelete,
}) {
  const score = clampScore(item.overallScore);
  const color = scoreColor(score);
  const busy = viewing || deleting;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24, scale: 0.97 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      style={styles.itemCard}
    >
      <div style={styles.itemRow}>
        <div style={styles.itemMain}>
          <div style={styles.itemIcon}>
            <FileText size={18} color="#5EEAD4" />
          </div>
          <div style={styles.itemInfo}>
            <div style={styles.itemName}>{item.fileName || "Untitled resume"}</div>
            <div style={styles.itemDate}>{formatDate(item.createdAt)}</div>
          </div>
        </div>

        <div style={styles.itemActions}>
          <span
            style={{
              ...styles.badge,
              color,
              background: `${color}12`,
              border: `1px solid ${color}33`,
            }}
          >
            {score}
          </span>
          <motion.button
            type="button"
            whileHover={busy ? {} : { scale: 1.02 }}
            whileTap={busy ? {} : { scale: 0.98 }}
            onClick={() => onView(item)}
            disabled={busy}
            style={{ ...styles.viewBtn, opacity: busy ? 0.65 : 1 }}
          >
            {viewing ? (
              <Spinner />
            ) : (
              <>
                View <ArrowRight size={14} />
              </>
            )}
          </motion.button>
          <motion.button
            type="button"
            whileHover={deleting ? {} : { scale: 1.08 }}
            whileTap={deleting ? {} : { scale: 0.95 }}
            onClick={() => onToggleConfirm(item._id)}
            disabled={deleting}
            aria-label="Delete analysis"
            title="Delete analysis"
            style={styles.trashBtn}
          >
            <Trash2 size={16} color="#F87171" />
          </motion.button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {confirming && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={styles.confirmRow}
          >
            <span style={styles.confirmText}>Delete this analysis?</span>
            <button type="button" onClick={() => onToggleConfirm(null)} style={styles.cancelBtn}>
              No
            </button>
            <button
              type="button"
              onClick={() => onDelete(item._id)}
              disabled={deleting}
              style={styles.yesBtn}
            >
              {deleting ? "Deleting..." : "Yes"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div style={styles.list}>
      <motion.div
        animate={{ opacity: [0.45, 0.9, 0.45] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        style={{ ...styles.card, height: 300 }}
      />
      <div style={styles.statsRow}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.45, 0.9, 0.45] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: i * 0.1 }}
            style={styles.skeletonItem}
          />
        ))}
      </div>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.45, 0.9, 0.45] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: i * 0.1 }}
          style={styles.skeletonItem}
        >
          <div style={styles.skeletonBarLong} />
          <div style={styles.skeletonBarShort} />
        </motion.div>
      ))}
    </div>
  );
}

function EmptyState({ onAnalyze }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={styles.stateCard}
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 14 }}
        style={styles.stateIcon}
      >
        <History size={26} color="#0B0F14" strokeWidth={2.4} />
      </motion.div>
      <h2 style={styles.stateTitle}>No analyses yet</h2>
      <p style={styles.emptyText}>
        Analyze a resume and we'll keep every score here so you can track your progress.
      </p>
      <motion.button
        whileHover={{ scale: 1.015, boxShadow: "0 10px 30px -8px #5EEAD466" }}
        whileTap={{ scale: 0.98 }}
        onClick={onAnalyze}
        style={styles.primaryBtn}
      >
        Analyze a resume <ArrowRight size={16} />
      </motion.button>
    </motion.div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={styles.stateCard}
    >
      <div style={{ ...styles.stateIcon, background: "#F8717118", border: "1px solid #F8717133" }}>
        <AlertCircle size={26} color="#F87171" strokeWidth={2.2} />
      </div>
      <h2 style={styles.stateTitle}>Couldn't load history</h2>
      <p style={styles.emptyText}>{message}</p>
      <motion.button
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.98 }}
        onClick={onRetry}
        style={styles.primaryBtn}
      >
        <RefreshCw size={16} /> Try again
      </motion.button>
    </motion.div>
  );
}

// ---- Main component ----

export default function HistoryPage() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const loadAnalyses = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const { data } = await api.get("/api/analyses");
      if (!data?.success) throw new Error(data?.message || "Failed to load analyses");
      setAnalyses(Array.isArray(data.analyses) ? data.analyses : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load your history. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalyses();
  }, [loadAnalyses]);

  const newestFirst = useMemo(
    () => [...analyses].sort((a, b) => timeOf(b.createdAt) - timeOf(a.createdAt)),
    [analyses]
  );
  const oldestFirst = useMemo(() => [...newestFirst].reverse(), [newestFirst]);

  const total = analyses.length;
  const best = analyses.reduce((max, item) => Math.max(max, clampScore(item.overallScore)), 0);
  const improvement = total
    ? clampScore(newestFirst[0].overallScore) - clampScore(oldestFirst[0].overallScore)
    : 0;

  const trendData = useMemo(
    () =>
      oldestFirst.map((item) => ({
        label: formatShortDate(item.createdAt),
        fileName: item.fileName || "Untitled resume",
        score: clampScore(item.overallScore),
        createdAt: item.createdAt,
      })),
    [oldestFirst]
  );

  async function handleView(item) {
    setViewingId(item._id);
    setNotice(null);

    try {
      const { data } = await api.get(`/api/analyses/${item._id}`);
      if (!data?.success) throw new Error(data?.message || "Failed to load analysis");

      navigate("/dashboard", {
        state: {
          analysis: data.analysis,
          fileName: item.fileName || data.analysis?.fileName || "Untitled resume",
        },
      });
    } catch (err) {
      setNotice(err?.response?.data?.message || "Could not open this analysis. Please try again.");
    } finally {
      setViewingId(null);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    setNotice(null);

    try {
      const { data } = await api.delete(`/api/analyses/${id}`);
      if (!data?.success) throw new Error(data?.message || "Failed to delete analysis");

      setAnalyses((prev) => prev.filter((item) => item._id !== id));
      setConfirmId(null);
    } catch (err) {
      setNotice(err?.response?.data?.message || "Could not delete this analysis. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const subtitle = loading
    ? "Loading your analyses..."
    : error
      ? "We couldn't load your analyses"
      : `${total} ${total === 1 ? "analysis" : "analyses"} saved`;

  return (
    <div style={styles.page}>
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
          <div>
            <h1 style={styles.pageTitle}>Your History</h1>
            <p style={styles.pageSubtitle}>{subtitle}</p>
          </div>
        </motion.div>

        {notice && !loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.notice}
          >
            <AlertCircle size={16} color="#F87171" />
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice(null)} style={styles.dismissBtn}>
              Dismiss
            </button>
          </motion.div>
        )}

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={loadAnalyses} />
        ) : total === 0 ? (
          <EmptyState onAnalyze={() => navigate("/upload")} />
        ) : (
          <>
            {/* Score trend */}
            {total >= 2 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                style={styles.card}
              >
                <h3 style={styles.cardTitle}>
                  <TrendingUp size={16} style={{ marginRight: 6, verticalAlign: -2, color: "#5EEAD4" }} />
                  Score Trend
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={trendData} margin={{ top: 10, right: 12, bottom: 0, left: -18 }}>
                    <CartesianGrid stroke="#22303A" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#7C8A96", fontSize: 11 }}
                      axisLine={{ stroke: "#22303A" }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      tick={{ fill: "#7C8A96", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<TrendTooltip />} cursor={{ stroke: "#5EEAD433" }} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#5EEAD4"
                      strokeWidth={2.5}
                      dot={{ fill: "#5EEAD4", r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: "#5EEAD4" }}
                      isAnimationActive
                      animationDuration={900}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                style={styles.note}
              >
                <TrendingUp size={16} color="#F5C451" />
                <span>Analyze more resumes to see your progress over time</span>
              </motion.div>
            )}

            {/* Stats */}
            <div style={styles.statsRow}>
              <StatCard
                icon={<Layers size={16} />}
                label="Total analyses"
                value={total}
                color="#5EEAD4"
                delay={0.15}
              />
              <StatCard
                icon={<Trophy size={16} />}
                label="Best score"
                value={best}
                color={scoreColor(best)}
                delay={0.22}
              />
              <StatCard
                icon={<TrendingUp size={16} />}
                label="Improvement"
                value={`${improvement >= 0 ? "+" : ""}${improvement}`}
                color={improvement >= 0 ? "#5EEAD4" : "#F87171"}
                delay={0.29}
              />
            </div>

            {/* List */}
            <h3 style={styles.listTitle}>Past analyses</h3>
            <div style={styles.list}>
              <AnimatePresence initial={false}>
                {newestFirst.map((item, index) => (
                  <HistoryItem
                    key={item._id}
                    item={item}
                    index={index}
                    viewing={viewingId === item._id}
                    deleting={deletingId === item._id}
                    confirming={confirmId === item._id}
                    onView={handleView}
                    onToggleConfirm={setConfirmId}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          </>
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
    marginBottom: 4,
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
  note: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 18px",
    borderRadius: 14,
    background: "#F5C4510D",
    border: "1px solid #F5C45122",
    color: "#F5C451",
    fontSize: 13,
  },
  statsRow: {
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
  },
  statCard: {
    flex: "1 1 240px",
    minWidth: 0,
    padding: "18px 20px",
    borderRadius: 14,
    background: "linear-gradient(160deg, #12181F 0%, #0E1319 100%)",
    border: "1px solid #22303A",
    boxShadow: "0 12px 40px -12px #00000088",
  },
  statTop: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  statLabel: {
    color: "#7C8A96",
    fontSize: 12,
    fontWeight: 500,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    marginTop: 8,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#7C8A96",
    margin: "4px 0 -8px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  itemCard: {
    padding: "16px 20px",
    borderRadius: 14,
    background: "#0B0F14",
    border: "1px solid #1A222B",
    overflow: "hidden",
  },
  itemRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  },
  itemMain: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  itemIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "#5EEAD412",
    border: "1px solid #5EEAD422",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  itemInfo: {
    minWidth: 0,
  },
  itemName: {
    color: "#E7ECEF",
    fontSize: 14,
    fontWeight: 600,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  itemDate: {
    color: "#7C8A96",
    fontSize: 12,
    marginTop: 3,
  },
  itemActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
  },
  badge: {
    minWidth: 38,
    textAlign: "center",
    padding: "5px 10px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
  },
  viewBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "8px 14px",
    borderRadius: 9,
    border: "1px solid #5EEAD422",
    background: "#5EEAD412",
    color: "#5EEAD4",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    minWidth: 78,
  },
  trashBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    border: "1px solid #F8717133",
    background: "#F8717112",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  confirmRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    overflow: "hidden",
    marginTop: 14,
    paddingTop: 14,
    borderTop: "1px solid #22303A",
  },
  confirmText: {
    color: "#9CA3AF",
    fontSize: 12,
    marginRight: "auto",
  },
  cancelBtn: {
    padding: "6px 14px",
    borderRadius: 8,
    border: "1px solid #22303A",
    background: "#12181F",
    color: "#7C8A96",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
  },
  yesBtn: {
    padding: "6px 14px",
    borderRadius: 8,
    border: "1px solid #F8717133",
    background: "#F8717118",
    color: "#F87171",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  notice: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    borderRadius: 10,
    background: "#F8717115",
    border: "1px solid #F8717133",
    color: "#FCA5A5",
    fontSize: 13,
  },
  dismissBtn: {
    marginLeft: "auto",
    flexShrink: 0,
    padding: "4px 8px",
    borderRadius: 7,
    border: "1px solid #F8717133",
    background: "transparent",
    color: "#FCA5A5",
    fontSize: 11,
    cursor: "pointer",
  },
  stateCard: {
    position: "relative",
    width: "100%",
    maxWidth: 460,
    margin: "6vh auto 0",
    borderRadius: 20,
    padding: "40px 36px",
    textAlign: "center",
    background: "linear-gradient(160deg, #12181F 0%, #0E1319 100%)",
    border: "1px solid #22303A",
    boxShadow: "0 30px 80px -20px #000000aa, 0 0 0 1px #ffffff05",
  },
  stateIcon: {
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
  stateTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#E7ECEF",
    margin: 0,
  },
  emptyText: {
    color: "#7C8A96",
    fontSize: 14,
    lineHeight: 1.6,
    marginTop: 10,
  },
  primaryBtn: {
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
  skeletonItem: {
    padding: "22px 20px",
    borderRadius: 14,
    background: "#12181F",
    border: "1px solid #22303A",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  skeletonBarLong: {
    width: "45%",
    height: 12,
    borderRadius: 6,
    background: "#22303A",
  },
  skeletonBarShort: {
    width: 60,
    height: 12,
    borderRadius: 6,
    background: "#22303A",
  },
  spinner: {
    width: 14,
    height: 14,
    border: "2px solid #5EEAD440",
    borderTopColor: "#5EEAD4",
    borderRadius: "50%",
    display: "inline-block",
    flexShrink: 0,
  },
  tooltip: {
    background: "#1A222B",
    border: "1px solid #22303A",
    borderRadius: 10,
    color: "#E7ECEF",
    fontSize: 12,
    padding: "10px 12px",
    minWidth: 150,
  },
  tooltipName: {
    color: "#E7ECEF",
    fontWeight: 600,
    marginBottom: 8,
    maxWidth: 200,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  tooltipRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    marginTop: 4,
  },
  tooltipLabel: {
    color: "#7C8A96",
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
