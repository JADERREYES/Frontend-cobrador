import React, { useState } from "react";
import { authAPI } from "../services/api";

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = usuario.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!email || !cleanPassword) {
      setError("Ingrese correo y contraseña");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("🔐 LOGIN COBRADOR");
      console.log("📤 Enviando:", {
        email,
        password: cleanPassword ? "***" : ""
      });

      const res = await authAPI.cobradorLogin(email, cleanPassword);

      console.log("✅ Respuesta login cobrador:", res.data);

      if (!res.data?.token || !res.data?.user) {
        setError("Respuesta inválida del servidor");
        return;
      }

      if (res.data.user.rol !== "cobrador") {
        setError("No tienes permisos de cobrador");
        return;
      }

      localStorage.setItem("cobrador_token", res.data.token);
      localStorage.setItem("cobrador_user", JSON.stringify(res.data.user));

      if (res.data.user.tenantId) {
        localStorage.setItem("tenantId", res.data.user.tenantId);
      }

      onLogin(res.data.user, res.data.token);
    } catch (err) {
      console.error("❌ Error login cobrador:", err);
      console.error("❌ Backend respondió:", err.response?.data);

      if (err.code === "ECONNABORTED") {
        setError("Tiempo de espera agotado. Intenta de nuevo.");
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.error || "Datos incompletos");
      } else if (err.response?.status === 401) {
        setError(err.response?.data?.error || "Credenciales inválidas");
      } else if (!err.response) {
        setError("No se pudo conectar con el servidor");
      } else {
        setError(err.response?.data?.error || "Error al iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "16px",
    outline: "none",
    marginBottom: "20px",
    boxSizing: "border-box",
    background: "#fff",
    color: "#1e293b"
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        fontFamily: "Inter, sans-serif"
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "40px 28px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 4px 32px rgba(0,0,0,0.08)"
        }}
      >
        <div
          style={{
            width: "68px",
            height: "68px",
            background: "#0d9488",
            borderRadius: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: "30px"
          }}
        >
          💧
        </div>

        <h1
          style={{
            textAlign: "center",
            fontSize: "26px",
            fontWeight: "800",
            color: "#1e293b",
            marginBottom: "4px"
          }}
        >
          Gota a Gota
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            fontSize: "15px",
            marginBottom: "32px"
          }}
        >
          Sistema de cobros
        </p>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              color: "#ef4444",
              padding: "12px 16px",
              borderRadius: "10px",
              marginBottom: "20px",
              fontSize: "14px",
              textAlign: "center",
              border: "1px solid #fee2e2"
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="usuario"
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "6px"
            }}
          >
            Correo electrónico
          </label>

          <input
            id="usuario"
            name="usuario"
            style={inputStyle}
            type="text"
            placeholder="Ingrese su correo"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            disabled={loading}
          />

          <label
            htmlFor="password"
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "6px"
            }}
          >
            Contraseña
          </label>

          <input
            id="password"
            name="password"
            style={inputStyle}
            type="password"
            placeholder="Ingrese su contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              background: loading ? "#5eaaa4" : "#0d9488",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}