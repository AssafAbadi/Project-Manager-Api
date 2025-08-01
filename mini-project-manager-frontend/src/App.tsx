import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";

function App() {
  // State for user authentication based on token in sessionStorage
  const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem("token"));

  // Handle logout from Dashboard
  function handleLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    setIsAuthenticated(false);
  }

  return (
    <Router>
      <Routes>
        {/* Login page */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" />
              : <LoginPage onLogin={() => setIsAuthenticated(true)} />
          }
        />
        {/* Register page */}
        <Route
          path="/register"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" />
              : <RegisterPage />
          }
        />
        {/* Dashboard page */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated
              ? <Dashboard onLogout={handleLogout} />
              : <Navigate to="/" />
          }
        />
        {/* Fallback route: redirect any unknown path to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {/* Links to Login/Register if not authenticated */}
      {!isAuthenticated && (
        <div style={{ textAlign: "center", margin: 14 }}>
          <Link to="/">Login</Link> | <Link to="/register">Register</Link>
        </div>
      )}
    </Router>
  );
}

export default App;
