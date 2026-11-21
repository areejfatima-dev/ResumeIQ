import React, { useState, useRef } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Mail, Lock, ArrowRight, UserPlus, User, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, user, loading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // ---- 3D tilt (same pattern as LoginPage) ----
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

  // ---- Validation ----
  function validate() {
    const next = {};
    if (!fullName.trim()) next.fullName = "Name is required";
    if (!email.trim()) next.email = "Email is required";
    if (!password) next.password = "Password is required";
    else if (password.length < 8) next.password = "Use 8+ characters";
    if (!confirmPassword) next.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) next.confirmPassword = "Passwords do not match";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      await signup(fullName.trim(), email, password);
      setSuccess(true);
      setTimeout(() => navigate("/upload"), 900);
    } catch (err) {
      setApiError(err.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (!loading && user) {
    return <Navigate to="/upload" replace />;
  }

  // Password strength hint (shown below password field, only when typing)
  const passwordHint =
    password.length === 0
      ? null
      : password.length < 8
        ? { text: "Use 8+ characters", color: "#F87171" }
        : /[A-Z]/.test(password) && /[0-9]/.test(password)
          ? { text: "Strong password", color: "#5EEAD4" }
          : { text: "Good — add numbers & capital letters for strength", color: "#F5C451" };

  // ---- Success state ----
  if (success) {
    return (
      <div style={pageStyle}>
        <FloatingOrb size={420} color="#5EEAD433" top="-10%" left="-8%" duration={14} />
        <FloatingOrb size={320} color="#F5C45122" bottom="-12%" right="-6%" duration={18} />
        <div style={gridStyle} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            ...cardBaseStyle,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "48px 36px",
          }}
        >
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 14 }}
            style={iconBadgeStyle}
          >
            <CheckCircle2 size={28} color="#0B0F14" strokeWidth={2.4} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{ fontSize: 26, fontWeight: 700, color: "#E7ECEF", margin: "0 0 8px" }}
          >
            Account created!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            style={{ color: "#7C8A96", fontSize: 14, marginBottom: 28 }}
          >
            Welcome aboard. Let's analyze some resumes.
          </motion.p>

          <Link to="/" style={{ textDecoration: "none" }}>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              whileHover={{ scale: 1.015, boxShadow: "0 10px 30px -8px #5EEAD466" }}
              whileTap={{ scale: 0.98 }}
              style={btnStyle}
            >
              Go to sign in <ArrowRight size={16} />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // ---- Signup form ----
  return (
    <div style={pageStyle}>
      <FloatingOrb size={420} color="#5EEAD433" top="-10%" left="-8%" duration={14} />
      <FloatingOrb size={320} color="#F5C45122" bottom="-12%" right="-6%" duration={18} />
      <FloatingOrb size={200} color="#5EEAD422" top="55%" left="72%" duration={11} />

      <div style={gridStyle} />

      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          ...cardBaseStyle,
          rotateX: rx,
          rotateY: ry,
          transformStyle: "preserve-3d",
          transformPerspective: 1000,
        }}
      >
        {/* Mouse-tracking glow */}
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
          {/* Icon badge */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 14 }}
            style={iconBadgeStyle}
          >
            <UserPlus size={26} color="#0B0F14" strokeWidth={2.4} />
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            style={{ fontSize: 26, fontWeight: 700, color: "#E7ECEF", margin: 0, letterSpacing: "-0.02em" }}
          >
            Create your account
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.32, duration: 0.5 }}
            style={{ color: "#7C8A96", fontSize: 14, margin: "6px 0 30px" }}
          >
            Start tracking your resume's ATS score.
          </motion.p>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Full name */}
            <FieldRow delay={0.4} error={errors.fullName}>
              <User size={17} color="#7C8A96" />
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); clearError("fullName"); }}
                style={inputStyle}
              />
            </FieldRow>
            {errors.fullName && <p style={fieldErrorStyle}>{errors.fullName}</p>}

            {/* Email */}
            <FieldRow delay={0.46} error={errors.email}>
              <Mail size={17} color="#7C8A96" />
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                style={inputStyle}
              />
            </FieldRow>
            {errors.email && <p style={fieldErrorStyle}>{errors.email}</p>}

            {/* Password */}
            <FieldRow delay={0.52} error={errors.password}>
              <Lock size={17} color="#7C8A96" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                style={inputStyle}
              />
            </FieldRow>
            {errors.password && <p style={fieldErrorStyle}>{errors.password}</p>}

            {/* Password strength hint */}
            {passwordHint && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ color: passwordHint.color, fontSize: 12, marginTop: -8, marginBottom: 14, paddingLeft: 2 }}
              >
                {passwordHint.text}
              </motion.p>
            )}

            {/* Confirm password */}
            <FieldRow delay={0.58} error={errors.confirmPassword}>
              <Lock size={17} color="#7C8A96" />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); clearError("confirmPassword"); }}
                style={inputStyle}
              />
            </FieldRow>
            {errors.confirmPassword && <p style={fieldErrorStyle}>{errors.confirmPassword}</p>}

            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={errorBoxStyle}
              >
                <AlertCircle size={16} color="#F87171" style={{ flexShrink: 0 }} />
                <span>{apiError}</span>
              </motion.div>
            )}

            {/* Submit button */}
            <motion.button
              type="submit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.64, duration: 0.4 }}
              whileHover={!submitting ? { scale: 1.015, boxShadow: "0 10px 30px -8px #5EEAD466" } : {}}
              whileTap={!submitting ? { scale: 0.98 } : {}}
              disabled={submitting}
              style={{
                ...btnStyle,
                marginTop: 22,
                opacity: submitting ? 0.7 : 1,
                cursor: submitting ? "default" : "pointer",
              }}
            >
              {submitting ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  style={spinnerStyle}
                />
              ) : (
                <>
                  Create account <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.72 }}
            style={{ textAlign: "center", color: "#556270", fontSize: 13, marginTop: 22 }}
          >
            Already have an account?{" "}
            <Link to="/" style={{ color: "#5EEAD4", fontWeight: 500, textDecoration: "none" }}>
              Sign in
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );

  function clearError(field) {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }
}

// ---- Reusable building blocks ----

function FieldRow({ children, delay, error }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#0B0F14",
        border: error ? "1px solid #F8717155" : "1px solid #22303A",
        borderRadius: 12,
        padding: "12px 14px",
        marginBottom: error ? 4 : 14,
        transition: "border-color 0.2s",
      }}
    >
      {children}
    </motion.div>
  );
}

// ---- Shared style constants ----

const pageStyle = {
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
};

const gridStyle = {
  position: "absolute",
  inset: 0,
  backgroundImage:
    "linear-gradient(#ffffff08 1px, transparent 1px), linear-gradient(90deg, #ffffff08 1px, transparent 1px)",
  backgroundSize: "48px 48px",
  maskImage: "radial-gradient(circle at 50% 40%, black, transparent 75%)",
};

const cardBaseStyle = {
  position: "relative",
  width: "100%",
  maxWidth: 400,
  borderRadius: 20,
  padding: "40px 36px",
  background: "linear-gradient(160deg, #12181F 0%, #0E1319 100%)",
  border: "1px solid #22303A",
  boxShadow: "0 30px 80px -20px #000000aa, 0 0 0 1px #ffffff05",
};

const iconBadgeStyle = {
  width: 52,
  height: 52,
  borderRadius: 14,
  background: "linear-gradient(135deg, #5EEAD4, #2DD4BF)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 8px 24px -6px #5EEAD466",
  marginBottom: 22,
};

const btnStyle = {
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
};

const inputStyle = {
  background: "transparent",
  border: "none",
  outline: "none",
  color: "#E7ECEF",
  fontSize: 14,
  width: "100%",
};

const spinnerStyle = {
  width: 16,
  height: 16,
  border: "2px solid #0B0F1440",
  borderTopColor: "#0B0F14",
  borderRadius: "50%",
  display: "inline-block",
};

const fieldErrorStyle = {
  color: "#F87171",
  fontSize: 12,
  marginTop: -8,
  marginBottom: 10,
  paddingLeft: 2,
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

// ---- Floating background orb ----

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
