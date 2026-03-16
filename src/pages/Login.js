import React, { useState } from "react";
import { authAPI } from "../services/api";

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokenVisible, setTokenVisible] = useState(false); // Nuevo estado
  const [ultimoToken, setUltimoToken] = useState(""); // Nuevo estado

  const handleSubmit = async () => {
    if (!usuario || !password) { setError("Ingrese todos los campos"); return; }
    setLoading(true); setError("");
    try {
      const res = await authAPI.login(usuario, password);
      
      // Guardar el token para mostrarlo
      setUltimoToken(res.data.token);
      
      // Llamar al onLogin original
      onLogin(res.data.user, res.data.token);
      
    } catch (err) {
      setError(err.response?.data?.error || "Error al iniciar sesion");
    } finally { setLoading(false); }
  };

  // Función para copiar token al portapapeles
  const copiarToken = () => {
    navigator.clipboard.writeText(ultimoToken);
    alert('✅ Token copiado al portapapeles');
  };

  const inputStyle = {
    width: "100%", padding: "14px 16px",
    border: "1.5px solid #e2e8f0", borderRadius: "12px",
    fontSize: "16px", outline: "none", marginBottom: "20px",
    boxSizing: "border-box", WebkitAppearance: "none",
    background: "#fff", color: "#1e293b"
  };

  return (
    <div style={{
      minHeight: "100vh", minHeight: "-webkit-fill-available",
      background: "#f1f5f9", display: "flex",
      alignItems: "center", justifyContent: "center",
      padding: "16px", fontFamily: "Inter, sans-serif"
    }}>
      <div style={{
        background: "#fff", borderRadius: "20px",
        padding: "40px 28px", width: "100%", maxWidth: "400px",
        boxShadow: "0 4px 32px rgba(0,0,0,0.08)"
      }}>
        <div style={{
          width: "68px", height: "68px", background: "#0d9488",
          borderRadius: "18px", display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 20px", fontSize: "30px"
        }}>
          &#128181;
        </div>
        <h1 style={{ textAlign: "center", fontSize: "26px", fontWeight: "800", color: "#1e293b", marginBottom: "4px" }}>
          Gota a Gota
        </h1>
        <p style={{ textAlign: "center", color: "#64748b", fontSize: "15px", marginBottom: "32px" }}>
          Sistema de cobros
        </p>

        {error && (
          <div style={{ background: "#fef2f2", color: "#ef4444", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px", textAlign: "center" }}>
            {error}
          </div>
        )}

        <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
          Usuario
        </label>
        <input
          style={inputStyle}
          type="text"
          placeholder="Correo electronico o cedula"
          value={usuario}
          onChange={e => setUsuario(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="username"
        />

        <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
          Contrasena
        </label>
        <input
          style={inputStyle}
          type="password"
          placeholder="Ingrese su contrasena"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          autoComplete="current-password"
        />

        <button
          style={{
            width: "100%", padding: "16px",
            background: loading ? "#5eaaa4" : "#0d9488",
            color: "#fff", border: "none", borderRadius: "12px",
            fontSize: "16px", fontWeight: "700",
            cursor: loading ? "not-allowed" : "pointer",
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation"
          }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Iniciando..." : "Iniciar Sesion"}
        </button>

        {/* 🔥 NUEVO: Botón para mostrar/ocultar token (solo para desarrollo) */}
        {ultimoToken && (
          <div style={{ marginTop: "20px", borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
            <button
              onClick={() => setTokenVisible(!tokenVisible)}
              style={{
                background: "none",
                border: "1px dashed #0d9488",
                borderRadius: "8px",
                padding: "8px",
                color: "#0d9488",
                fontSize: "14px",
                cursor: "pointer",
                width: "100%",
                marginBottom: "8px"
              }}
            >
              {tokenVisible ? "🔒 Ocultar Token" : "🔑 Mostrar Token (solo pruebas)"}
            </button>
            
            {tokenVisible && (
              <div style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "12px",
                position: "relative"
              }}>
                <p style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginBottom: "8px",
                  wordBreak: "break-all",
                  fontFamily: "monospace"
                }}>
                  {ultimoToken}
                </p>
                <button
                  onClick={copiarToken}
                  style={{
                    background: "#0d9488",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    cursor: "pointer",
                    width: "100%"
                  }}
                >
                  📋 Copiar Token
                </button>
              </div>
            )}
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8", marginTop: "16px" }}>
          Ingresa con tu correo o numero de cedula
        </p>
      </div>
    </div>
  );
}