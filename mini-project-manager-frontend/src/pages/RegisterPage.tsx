import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch(process.env.REACT_APP_API_URL + "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Registration failed. Username must be 3-20 characters. Password at least 6 characters.");
      }

      setSuccess("Registration successful! Redirecting to login...");
      setUsername("");
      setPassword("");
      setTimeout(() => { navigate("/"); }, 1500);
    } catch (err: any) {
      setError(err.message || "Registration failed. Try again.");
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
      <form
        onSubmit={handleRegister}
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
        <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, margin: 0, color: "#26395a" }}>Register</h2>
        <input
          type="text"
          placeholder="Username (3–100 characters)"
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
          placeholder="Password (6–100 characters)"
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
          }}
        >
          Register
        </button>
        {success && (
          <div
            style={{
              color: "#22c55e",
              background: "#f0fdf4",
              borderRadius: 8,
              padding: "7px 12px",
              fontSize: 15,
              textAlign: "center",
            }}
          >
            {success}
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

export default RegisterPage;
