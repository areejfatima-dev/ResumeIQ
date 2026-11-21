import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import UploadPage from "./pages/UploadPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

function AppShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const showBar = Boolean(user) && pathname !== "/" && pathname !== "/signup";

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <>
      {showBar && (
        <header style={styles.topBar}>
          <div style={styles.brand}>ResumeIQ</div>
          <nav style={styles.navLinks}>
            <NavLink to="/upload" label="Analyze" active={pathname === "/upload"} />
            <NavLink to="/dashboard" label="Dashboard" active={pathname === "/dashboard"} />
          </nav>
          <div style={styles.rightSide}>
            <span style={styles.userName}>{user?.name}</span>
            <button type="button" onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </header>
      )}

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function NavLink({ to, label, active }) {
  return (
    <Link
      to={to}
      style={{
        ...styles.navLink,
        color: active ? "#5EEAD4" : "#7C8A96",
        background: active ? "#5EEAD410" : "transparent",
        borderBottom: active ? "2px solid #5EEAD4" : "2px solid transparent",
      }}
    >
      {label}
    </Link>
  );
}

const styles = {
  topBar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "0 24px",
    background: "#12181Fcc",
    backdropFilter: "blur(8px)",
    borderBottom: "1px solid #22303A",
  },
  brand: {
    color: "#5EEAD4",
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  navLink: {
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    transition: "color 0.2s, background 0.2s",
  },
  rightSide: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  userName: {
    color: "#E7ECEF",
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  logoutBtn: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #22303A",
    background: "#0B0F14",
    color: "#7C8A96",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
};

export default App;
