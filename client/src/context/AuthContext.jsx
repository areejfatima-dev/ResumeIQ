import React, { createContext, useContext, useEffect, useState } from "react";
import api, { clearStoredToken, getStoredToken, setStoredToken } from "../api";

const AuthContext = createContext(null);

function getErrorMessage(err, fallback) {
  return err?.response?.data?.message || err?.message || fallback;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const storedToken = getStoredToken();
      if (!storedToken) {
        if (!cancelled) {
          setUser(null);
          setToken(null);
          setLoading(false);
        }
        return;
      }

      try {
        const { data } = await api.get("/api/auth/me");
        if (cancelled) return;
        setToken(storedToken);
        setUser(data?.user || null);
      } catch (err) {
        if (cancelled) return;
        if (err?.response?.status === 401) {
          clearStoredToken();
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  async function login(email, password) {
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      if (!data?.token || !data?.user) {
        throw new Error("Login failed");
      }
      setStoredToken(data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      throw new Error(getErrorMessage(err, "Login failed"));
    }
  }

  async function signup(name, email, password) {
    try {
      const { data } = await api.post("/api/auth/signup", { name, email, password });
      if (!data?.token || !data?.user) {
        throw new Error("Signup failed");
      }
      setStoredToken(data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      throw new Error(getErrorMessage(err, "Signup failed"));
    }
  }

  function logout() {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
