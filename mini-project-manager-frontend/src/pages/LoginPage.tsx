import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

type LoginPageProps = {
  onLogin?: () => void;
};

const spinnerStyle = {
  display: "flex",
  justifyContent: "center",
  marginTop: 10,
};

const spinnerDot = {
  border: "4px solid #f3f3f3",
  borderTop: "4px solid #3498db",
  borderRadius: "50%",
  width: 32,
  height: 32,
  animation: "spin 0.7s linear infinite",
};

const LoginPage: React.FC<LoginPageProps> = ({ onLogin = () => { } }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // loading state
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true); // Start spinner
    try {
      const res = await fetch(process.env.REACT_APP_API_URL + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();

      sessionStorage.setItem("token", data.token);

      onLogin();
      navigate("/dashboard");
    } catch {
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false); // Stop spinner
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}
      </style>
      <form
        onSubmit={handleLogin}
        style={{
          background: "rgba(255,255,255,0.97)",
          padding: "42px 28px",
          borderRadius: 22,
          boxShadow: "0 8px 32px #bcd5ff3d",
          width: 330,
          display: "flex",
          flexDirection: "column",
          gap: 19,
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: 28,
            fontWeight: 700,
            margin: 0,
            color: "#26395a",
          }}
        >
          Login
        </h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          minLength={3}
          style={{
            fontSize: 17,
            padding: "12px 14px",
            border: "1px solid #d1d5db",
            borderRadius: 13,
            outline: "none",
            background: "#f6faff",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          style={{
            fontSize: 17,
            padding: "12px 14px",
            border: "1px solid #d1d5db",
            borderRadius: 13,
            outline: "none",
            background: "#f6faff",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: "linear-gradient(95deg,#68c4fa 0%,#007aff 90%)",
            color: "#fff",
            border: "none",
            borderRadius: 99,
            fontWeight: 700,
            fontSize: 18,
            padding: "13px 0px",
            cursor: "pointer",
            boxShadow: "0 3px 14px 0 rgba(0,122,255,0.09)",
            transition: "background 0.2s, box-shadow 0.15s, transform 0.12s",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {loading && (
          <div style={spinnerStyle}>
            <div style={spinnerDot} />
          </div>
        )}
        {error && (
          <div
            style={{
              color: "#dc2626",
              background: "#fff0f0",
              borderRadius: 8,
              padding: "7px 12px",
              fontSize: 15,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default LoginPage;
