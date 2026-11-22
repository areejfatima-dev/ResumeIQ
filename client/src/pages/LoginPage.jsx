import React, { useState, useRef } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Mail, Lock, ArrowRight, FileCheck2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PasswordToggle from "../components/PasswordToggle";

// ---- Design tokens ----
// bg: #0B0F14 (near-black ink)   card: #12181F
// accent: #5EEAD4 (teal, "ATS pass" signal)   accent2: #F5C451 (warm gold, warmth against cold ink)
// text: #E7ECEF   muted: #7C8A96

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const cardRef = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 150, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 18 });
  const glowX = useTransform(mx, [-0.5, 0.5], ["20%", "80%"]);
  const glowY = useTransform(my, [-0.5, 0.5], ["20%", "80%"]);

  function handleMouseMove(e) {
    const rect = cardRef.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handleMouseLeave() {
    mx.set(0);
    my.set(0);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/upload");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (!loading && user) {
    return <Navigate to="/upload" replace />;
  }

  return (
    <div
      style={{
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
      }}
    >
      {/* Ambient floating orbs — depth cue, not decoration */}
      <FloatingOrb size={420} color="#5EEAD433" top="-10%" left="-8%" duration={14} />
      <FloatingOrb size={320} color="#F5C45122" bottom="-12%" right="-6%" duration={18} />
      <FloatingOrb size={200} color="#5EEAD422" top="55%" left="72%" duration={11} />

      {/* Grid texture, faint */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(#ffffff08 1px, transparent 1px), linear-gradient(90deg, #ffffff08 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(circle at 50% 40%, black, transparent 75%)",
        }}
      />

      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          rotateX: rx,
          rotateY: ry,
          transformStyle: "preserve-3d",
          transformPerspective: 1000,
          position: "relative",
          width: "100%",
          maxWidth: 400,
          borderRadius: 20,
          padding: "40px 36px",
          background: "linear-gradient(160deg, #12181F 0%, #0E1319 100%)",
          border: "1px solid #22303A",
          boxShadow: "0 30px 80px -20px #000000aa, 0 0 0 1px #ffffff05",
        }}
      >
        {/* mouse-tracking glow */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 20,
            background: `radial-gradient(240px circle at ${glowX} ${glowY}, #5EEAD41a, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        <div style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}>
          {/* Signature mark: resume-check icon, floating badge */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 14 }}
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "linear-gradient(135deg, #5EEAD4, #2DD4BF)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px -6px #5EEAD466",
              marginBottom: 22,
            }}
          >
            <FileCheck2 size={26} color="#0B0F14" strokeWidth={2.4} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#E7ECEF",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Welcome back
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.32, duration: 0.5 }}
            style={{ color: "#7C8A96", fontSize: 14, margin: "6px 0 30px" }}
          >
            Sign in to see how your resume scores.
          </motion.p>

          <form onSubmit={handleSubmit}>
            <FieldRow delay={0.4}>
              <Mail size={17} color="#7C8A96" />
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                required
              />
            </FieldRow>

            <FieldRow delay={0.48}>
              <Lock size={17} color="#7C8A96" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                required
              />
              <PasswordToggle
                visible={showPassword}
                onToggle={() => setShowPassword((prev) => !prev)}
              />
            </FieldRow>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={errorBoxStyle}
              >
                <AlertCircle size={16} color="#F87171" style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </motion.div>
            )}

            <motion.button
              type="submit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.56, duration: 0.4 }}
              whileHover={{ scale: 1.015, boxShadow: "0 10px 30px -8px #5EEAD466" }}
              whileTap={{ scale: 0.98 }}
              disabled={submitting}
              style={{
                width: "100%",
                marginTop: 22,
                padding: "13px 0",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #5EEAD4, #2DD4BF)",
                color: "#0B0F14",
                fontWeight: 600,
                fontSize: 15,
                cursor: submitting ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {submitting ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid #0B0F1440",
                    borderTopColor: "#0B0F14",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                <>
                  Sign in <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            style={{ textAlign: "center", color: "#556270", fontSize: 13, marginTop: 22 }}
          >
            New here?{" "}
            <Link
              to="/signup"
              style={{ color: "#5EEAD4", fontWeight: 500, textDecoration: "none" }}
            >
              Create an account
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

function FieldRow({ children, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileFocus={{ borderColor: "#5EEAD4" }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#0B0F14",
        border: "1px solid #22303A",
        borderRadius: 12,
        padding: "12px 14px",
        marginBottom: 14,
      }}
    >
      {children}
    </motion.div>
  );
}

const inputStyle = {
  background: "transparent",
  border: "none",
  outline: "none",
  color: "#E7ECEF",
  fontSize: 14,
  width: "100%",
};

const errorBoxStyle = {
  marginTop: 2,
  marginBottom: 2,
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