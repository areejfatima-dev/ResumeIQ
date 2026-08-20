import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import LoginPage from "./pages/LoginPage";
import UploadPage from "./pages/UploadPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";

const NAV_LINKS = [
  { to: "/", label: "Login" },
  { to: "/upload", label: "Upload" },
  { to: "/signup", label: "Sign Up" },
  { to: "/dashboard", label: "Dashboard" },
];

function App() {
  return (
    <BrowserRouter>
      <TestNav />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

function TestNav() {
  const { pathname } = useLocation();

  return (
    <motion.nav
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed",
        top: "calc(50vh - 110px)",
        left: "calc(50vw - 340px)",
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        background: "#12181Fcc",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        padding: "8px",
        borderRadius: 16,
        border: "1px solid #22303A",
        boxShadow: "0 8px 32px -8px #00000066, inset 0 1px 0 #ffffff06",
      }}
    >
      {NAV_LINKS.map(({ to, label }) => {
        const active = pathname === to;
        return (
          <Link key={to} to={to} style={{ textDecoration: "none" }}>
            <motion.span
              whileHover={!active ? { x: 3, color: "#E7ECEF" } : {}}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 16px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "0.01em",
                color: active ? "#5EEAD4" : "#7C8A96",
                background: active ? "#5EEAD410" : "transparent",
                borderLeft: active ? "2px solid #5EEAD4" : "2px solid transparent",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              {label}
            </motion.span>
          </Link>
        );
      })}
    </motion.nav>
  );
}

export default App;
