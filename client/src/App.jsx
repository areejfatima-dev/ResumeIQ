import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
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

const navWrapperStyle = {
  position: "fixed",
  top: "100px",
  left: "32px",
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  background: "#12181Fcc",
  backdropFilter: "blur(8px)",
  padding: "16px",
  borderRadius: "16px",
  border: "1px solid #22303A",
};

function App() {
  return (
    <BrowserRouter>
      <div style={navWrapperStyle}>
        <TestNavLinks />
      </div>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

function TestNavLinks() {
  const { pathname } = useLocation();

  return (
    <>
      {NAV_LINKS.map(({ to, label }) => {
        const active = pathname === to;
        return (
          <Link key={to} to={to} style={{ textDecoration: "none" }}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                padding: "9px 16px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 500,
                color: active ? "#5EEAD4" : "#7C8A96",
                background: active ? "#5EEAD410" : "transparent",
                borderLeft: active ? "2px solid #5EEAD4" : "2px solid transparent",
                transition: "background 0.2s, color 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = "#E7ECEF";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = "#7C8A96";
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </>
  );
}

export default App;
