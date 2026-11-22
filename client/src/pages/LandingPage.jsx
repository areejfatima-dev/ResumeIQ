import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { AlertCircle, ArrowRight, Check, FileCheck2, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// ---- Configuration ----

const SHEETS = [
  { z: -130, x: -160, y: 26, rotate: -14, scale: 0.82, opacity: 0.3, duration: 7.5 },
  { z: -70, x: -86, y: -22, rotate: -7, scale: 0.9, opacity: 0.44, duration: 6.4 },
  { z: -10, x: 80, y: 30, rotate: 9, scale: 0.9, opacity: 0.54, duration: 8.2 },
  { z: 60, x: 0, y: 0, rotate: -2, scale: 1, opacity: 0.66, duration: 5.6 },
];

const CHIPS = [
  { label: "React", tone: "good", left: "2%", top: "22%", z: 140, duration: 5.2, delay: 0 },
  { label: "Node.js", tone: "good", right: "2%", top: "26%", z: 100, duration: 6.1, delay: 0.4 },
  { label: "TypeScript", tone: "bad", left: "8%", bottom: "12%", z: 170, duration: 5.6, delay: 0.8 },
  { label: "Docker", tone: "bad", right: "8%", bottom: "10%", z: 80, duration: 6.8, delay: 0.2 },
  { label: "ATS 92", tone: "gold", right: "12%", top: "8%", z: 200, duration: 4.9, delay: 0.6 },
  { label: "SQL", tone: "good", left: "12%", top: "8%", z: 120, duration: 7.2, delay: 1 },
];

// ---- Helpers ----

function useViewportHeight() {
  const [height, setHeight] = useState(() =>
    typeof window === "undefined" ? 900 : window.innerHeight
  );

  useEffect(() => {
    const onResize = () => setHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return height;
}

function useNarrow() {
  const [narrow, setNarrow] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia("(max-width: 767px)").matches
  );

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const onChange = (event) => setNarrow(event.matches);
    setNarrow(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return narrow;
}

function PillLink({ to, children, variant = "ghost", size = "small" }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const active = hovered || focused;
  const filled = variant === "filled";

  return (
    <Link
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...styles.pillLink,
        ...(filled ? styles.pillFilled : styles.pillGhost),
        ...(size === "large" ? styles.pillLarge : null),
        color: filled ? "#0B0F14" : active ? "#5EEAD4" : "#7C8A96",
        boxShadow: focused ? "0 0 0 2px #5EEAD4" : "none",
      }}
    >
      {children}
    </Link>
  );
}

function FloatingOrb({ size, color, top, left, right, bottom, duration, reduced }) {
  return (
    <motion.div
      animate={reduced ? {} : { y: [0, -24, 0], x: [0, 14, 0] }}
      transition={reduced ? { duration: 0 } : { repeat: Infinity, duration, ease: "easeInOut" }}
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

function ResumeSheet({ config, index, reduced, isTop }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={
        reduced
          ? { opacity: config.opacity, scale: 1 }
          : {
              opacity: config.opacity,
              scale: 1,
              y: [0, -12, 0],
              rotate: [0, 1.2, 0],
            }
      }
      transition={
        reduced
          ? { duration: 0 }
          : {
              opacity: { delay: 0.5 + index * 0.12, duration: 0.7 },
              scale: { delay: 0.5 + index * 0.12, duration: 0.7 },
              y: { repeat: Infinity, duration: config.duration, ease: "easeInOut", delay: index * 0.3 },
              rotate: {
                repeat: Infinity,
                duration: config.duration * 1.4,
                ease: "easeInOut",
                delay: index * 0.3,
              },
            }
      }
      style={styles.sheetSlot}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `translate3d(${config.x}px, ${config.y}px, ${config.z}px) rotate(${config.rotate}deg) scale(${config.scale})`,
          transformStyle: "preserve-3d",
        }}
      >
        <div style={styles.sheetFrame}>
          <div style={styles.sheet}>
            <div style={styles.avatar} />
            <div style={{ ...styles.skelLine, width: "58%", marginTop: 12, height: 10 }} />
            <div style={{ ...styles.skelLine, width: "34%", marginTop: 7, height: 6, opacity: 0.55 }} />

            <div style={{ ...styles.skelHead, width: "46%", marginTop: 22 }} />
            {[94, 80, 88, 62].map((width, i) => (
              <div key={i} style={{ ...styles.skelLine, width: `${width}%`, marginTop: 8 }} />
            ))}

            <div style={{ ...styles.skelHead, width: "38%", marginTop: 20 }} />
            {[86, 92, 70].map((width, i) => (
              <div key={i} style={{ ...styles.skelLine, width: `${width}%`, marginTop: 8 }} />
            ))}

            {isTop && (
              <motion.div
                animate={reduced ? { y: 110 } : { y: [0, 240, 0] }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { repeat: Infinity, duration: 3.4, ease: "easeInOut", delay: 1.2 }
                }
                style={styles.scanner}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function KeywordChip({ chip, reduced }) {
  const Icon = chip.tone === "good" ? Check : chip.tone === "bad" ? AlertCircle : Sparkles;
  const color = chip.tone === "good" ? "#5EEAD4" : chip.tone === "bad" ? "#F87171" : "#F5C451";

  return (
    <div
      style={{
        position: "absolute",
        left: chip.left,
        right: chip.right,
        top: chip.top,
        bottom: chip.bottom,
        transform: `translateZ(${chip.z}px)`,
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        animate={reduced ? {} : { y: [0, -12, 0], x: [0, 6, 0] }}
        transition={
          reduced
            ? { duration: 0 }
            : {
                y: { repeat: Infinity, duration: chip.duration, ease: "easeInOut", delay: chip.delay },
                x: {
                  repeat: Infinity,
                  duration: chip.duration * 1.3,
                  ease: "easeInOut",
                  delay: chip.delay,
                },
              }
        }
        style={{
          ...styles.chip,
          color,
          background: `${color}14`,
          border: `1px solid ${color}44`,
        }}
      >
        <Icon size={13} strokeWidth={2.4} />
        {chip.label}
      </motion.div>
    </div>
  );
}

// ---- Main component ----

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const reduced = Boolean(useReducedMotion());
  const narrow = useNarrow();
  const viewportHeight = useViewportHeight();
  const stageHeight = Math.min(viewportHeight * (narrow ? 0.5 : 0.62), 560);
  const sceneScale = narrow ? 0.46 : stageHeight / 348;
  const [startActive, setStartActive] = useState(false);
  const [startFocused, setStartFocused] = useState(false);
  const [secondaryActive, setSecondaryActive] = useState(false);
  const [secondaryFocused, setSecondaryFocused] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), {
    stiffness: 150,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), {
    stiffness: 150,
    damping: 18,
  });

  function handleMouseMove(e) {
    if (reduced) return;
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
  }

  function handleMouseLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <div style={styles.page} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div style={styles.grid} />
      <FloatingOrb size={420} color="#5EEAD433" top="-10%" left="-8%" duration={14} reduced={reduced} />
      <FloatingOrb size={320} color="#F5C45122" bottom="-12%" right="-6%" duration={18} reduced={reduced} />
      <FloatingOrb size={200} color="#5EEAD422" top="58%" left="74%" duration={11} reduced={reduced} />

      {/* Top-left logo */}
      <div style={styles.logo}>
        <div style={styles.logoBadge}>
          <FileCheck2 size={17} color="#0B0F14" strokeWidth={2.4} />
        </div>
        <span style={styles.logoName}>ResumeIQ</span>
      </div>

      {/* Top-right actions */}
      <div style={styles.topActions}>
        {user ? (
          <PillLink to="/upload" variant="filled">
            Open app <ArrowRight size={14} />
          </PillLink>
        ) : (
          <div style={styles.glassPill}>
            <PillLink to="/login">Login</PillLink>
            <PillLink to="/signup" variant="filled">
              Sign Up
            </PillLink>
          </div>
        )}
      </div>

      {/* One centered hero: Layer A = 3D background, Layer B = 2D foreground */}
      <main style={styles.main}>
        <div style={styles.hero}>
          {/* Layer A — 3D sheets, scanner and parallax only */}
          <div style={{ ...styles.sceneLayer, height: stageHeight }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                transformStyle: "preserve-3d",
                rotateX: reduced ? 0 : rotateX,
                rotateY: reduced ? 0 : rotateY,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 720,
                  height: 480,
                  transform: `translate(-50%, -50%) scale(${sceneScale})`,
                  transformStyle: "preserve-3d",
                }}
              >
                {SHEETS.map((config, index) => (
                  <ResumeSheet
                    key={index}
                    config={config}
                    index={index}
                    reduced={reduced}
                    isTop={index === SHEETS.length - 1}
                  />
                ))}
              </div>
              {!narrow &&
                CHIPS.map((chip) => <KeywordChip key={chip.label} chip={chip} reduced={reduced} />)}
            </motion.div>
          </div>

          {/* Layer B — normal 2D flow, centered on the same point as the sheets */}
          <div style={styles.foreground}>
            <div style={{ ...styles.copySlot, height: stageHeight }}>
              <div style={styles.heroCopy}>
                <motion.h1
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  style={styles.wordmark}
                >
                  <span>Resume</span>
                  <span style={styles.wordmarkIQ}>IQ</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38, duration: 0.5 }}
                  style={styles.tagline}
                >
                  From fresher to job-ready. Know your ATS score, close your skill gaps.
                </motion.p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              style={{
                ...styles.ctaRow,
                flexDirection: narrow ? "column" : "row",
                width: narrow ? "min(100%, 340px)" : "auto",
                marginTop: "clamp(32px, 4vh, 48px)",
              }}
            >
              <motion.button
                type="button"
                onClick={() => navigate("/signup")}
                onMouseEnter={() => setStartActive(true)}
                onMouseLeave={() => setStartActive(false)}
                onFocus={() => {
                  setStartActive(true);
                  setStartFocused(true);
                }}
                onBlur={() => {
                  setStartActive(false);
                  setStartFocused(false);
                }}
                whileHover={reduced ? undefined : { scale: 1.04 }}
                whileTap={reduced ? undefined : { scale: 0.97 }}
                style={{
                  ...styles.primaryCta,
                  ...(narrow ? styles.ctaFull : null),
                  boxShadow: startFocused
                    ? "0 0 0 3px #5EEAD466, 0 14px 34px -8px #5EEAD488"
                    : startActive
                      ? "0 14px 34px -8px #5EEAD488"
                      : "0 8px 24px -10px #5EEAD466",
                }}
              >
                <span>Get Started</span>
                <motion.span
                  animate={{ x: reduced ? 0 : startActive ? 5 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={styles.ctaArrow}
                >
                  <ArrowRight size={18} />
                </motion.span>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => navigate("/login")}
                onMouseEnter={() => setSecondaryActive(true)}
                onMouseLeave={() => setSecondaryActive(false)}
                onFocus={() => {
                  setSecondaryActive(true);
                  setSecondaryFocused(true);
                }}
                onBlur={() => {
                  setSecondaryActive(false);
                  setSecondaryFocused(false);
                }}
                whileHover={reduced ? undefined : { scale: 1.02, y: -2 }}
                whileTap={reduced ? undefined : { scale: 0.97 }}
                style={{
                  ...styles.secondaryCta,
                  ...(narrow ? styles.ctaFull : null),
                  color: secondaryActive ? "#5EEAD4" : "#E7ECEF",
                  borderColor: secondaryActive ? "#5EEAD4" : "#22303A",
                  boxShadow: secondaryFocused ? "0 0 0 2px #5EEAD466" : "none",
                }}
              >
                I already have an account
              </motion.button>
            </motion.div>
          </div>
        </div>
      </main>
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
    overflowX: "hidden",
    overflowY: "auto",
    color: "#E7ECEF",
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
  logo: {
    position: "absolute",
    top: 22,
    left: 24,
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    background: "linear-gradient(135deg, #5EEAD4, #2DD4BF)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 18px -6px #5EEAD466",
  },
  logoName: {
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "#E7ECEF",
  },
  topActions: {
    position: "absolute",
    top: 18,
    right: 24,
    zIndex: 10,
  },
  glassPill: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: 6,
    borderRadius: 999,
    background: "#12181Fcc",
    backdropFilter: "blur(10px)",
    border: "1px solid #22303A",
  },
  pillLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    textDecoration: "none",
    borderRadius: 999,
    fontWeight: 600,
    outline: "none",
    whiteSpace: "nowrap",
    transition: "color 0.2s, box-shadow 0.2s",
  },
  pillGhost: {
    padding: "8px 16px",
    fontSize: 13,
    background: "transparent",
  },
  pillFilled: {
    padding: "8px 16px",
    fontSize: 13,
    background: "linear-gradient(135deg, #5EEAD4, #2DD4BF)",
  },
  pillLarge: {
    padding: "13px 24px",
    fontSize: 15,
  },
  hero: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  sceneLayer: {
    position: "absolute",
    left: "50%",
    top: 0,
    transform: "translateX(-50%)",
    width: "min(100%, 940px)",
    perspective: 1200,
    transformStyle: "preserve-3d",
    pointerEvents: "none",
    zIndex: 0,
  },
  foreground: {
    position: "relative",
    zIndex: 2,
    width: "min(100%, 940px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  copySlot: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  heroCopy: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    width: "min(100%, 700px)",
    textAlign: "center",
  },
  sheetSlot: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 250,
    height: 320,
    marginLeft: -125,
    marginTop: -160,
    transformStyle: "preserve-3d",
  },
  sheetFrame: {
    position: "relative",
    width: "100%",
    height: "100%",
    transformStyle: "preserve-3d",
  },
  sheet: {
    position: "relative",
    width: "100%",
    height: "100%",
    padding: 20,
    borderRadius: 16,
    overflow: "hidden",
    background: "linear-gradient(160deg, rgba(18,24,31,0.96) 0%, rgba(11,15,20,0.9) 100%)",
    border: "1px solid #5EEAD426",
    boxShadow: "0 24px 60px -20px #000000cc, inset 0 0 0 1px #ffffff05",
    backdropFilter: "blur(6px)",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: "#5EEAD426",
    border: "1px solid #5EEAD433",
  },
  skelLine: {
    height: 6,
    borderRadius: 4,
    background: "#ffffff14",
  },
  skelHead: {
    height: 7,
    borderRadius: 4,
    background: "#5EEAD42e",
  },
  scanner: {
    position: "absolute",
    left: "6%",
    right: "6%",
    top: "14%",
    height: 2,
    background: "linear-gradient(90deg, transparent, #5EEAD4, transparent)",
    boxShadow: "0 0 16px 3px #5EEAD477",
    opacity: 0.9,
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    backdropFilter: "blur(6px)",
    boxShadow: "0 8px 24px -10px #000000aa",
  },
  main: {
    position: "relative",
    zIndex: 2,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "88px 24px",
  },
  wordmark: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "center",
    fontSize: "clamp(58px, 10vw, 112px)",
    fontWeight: 800,
    letterSpacing: "-0.06em",
    color: "#E7ECEF",
    lineHeight: 1,
    textShadow: "0 4px 30px rgba(11, 15, 20, 0.9)",
  },
  wordmarkIQ: {
    background: "linear-gradient(135deg, #5EEAD4, #2DD4BF)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  },
  tagline: {
    maxWidth: 560,
    margin: "0 auto",
    fontSize: 16,
    lineHeight: 1.6,
    color: "#B6C4CE",
    textShadow: "0 4px 30px rgba(11, 15, 20, 0.9)",
  },
  ctaRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  primaryCta: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "16px 32px",
    borderRadius: 999,
    border: "1px solid transparent",
    background: "linear-gradient(135deg, #5EEAD4, #2DD4BF)",
    color: "#0B0F14",
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
    outline: "none",
    whiteSpace: "nowrap",
  },
  secondaryCta: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px 32px",
    borderRadius: 999,
    border: "1px solid #22303A",
    background: "#12181Fcc",
    backdropFilter: "blur(10px)",
    color: "#E7ECEF",
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: "pointer",
    outline: "none",
    whiteSpace: "nowrap",
    transition: "color 0.2s, border-color 0.2s, box-shadow 0.2s",
  },
  ctaArrow: {
    display: "flex",
    alignItems: "center",
  },
  ctaFull: {
    width: "100%",
  },
};
