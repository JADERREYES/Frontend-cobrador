import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { clientesAPI, prestamosAPI } from "../services/api";

const fmt = n => "$ " + Number(n || 0).toLocaleString("es-CO");

const badgeColors = {
  nuevo: { background: "#f1f5f9", color: "#475569" },
  recurrente: { background: "#d1fae5", color: "#065f46" },
  moroso: { background: "#fee2e2", color: "#991b1b" },
};

export default function ClienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, pRes] = await Promise.all([clientesAPI.getById(id), prestamosAPI.getByCliente(id)]);
        setCliente(cRes.data);
        setPrestamos(pRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return <div style={{ textAlign: "center", padding: "80px 20px", color: "#94a3b8", fontSize: "16px" }}>Cargando...</div>;
  if (!cliente) return <div style={{ textAlign: "center", padding: "80px 20px", color: "#94a3b8" }}>Cliente no encontrado</div>;

  const totalPrestado = prestamos.reduce((s, p) => s + p.capital, 0);
  const totalPagado = prestamos.reduce((s, p) => s + p.totalPagado, 0);
  const activos = prestamos.filter(p => p.estado === "activo").length;

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0d9488, #0f766e)", padding: "0 20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "16px", marginBottom: "20px" }}>
          <button onClick={() => navigate("/clientes")} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "10px", width: "36px", height: "36px", color: "#fff", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "inherit" }}>←</button>
          <span style={{ fontSize: "17px", fontWeight: "700", color: "#fff" }}>Detalle del Cliente</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "56px", height: "56px", background: "rgba(255,255,255,0.2)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", border: "1.5px solid rgba(255,255,255,0.3)", flexShrink: 0 }}>👤</div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#fff" }}>{cliente.nombre}</div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>CC: {cliente.cedula}</div>
            <span style={{ display: "inline-block", marginTop: "4px", padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: "rgba(255,255,255,0.2)", color: "#fff" }}>{cliente.tipoCliente}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 20px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "16px" }}>
          {[
            { label: "Creditos", value: prestamos.length, color: "#1e293b" },
            { label: "Activos", value: activos, color: "#f59e0b" },
            { label: "Pagados", value: prestamos.length - activos, color: "#22c55e" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: "12px", padding: "14px 12px", textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "22px", fontWeight: "800", color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Info Card */}
        <div style={{ background: "#fff", borderRadius: "14px", padding: "18px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", marginBottom: "12px" }}>Informacion de contacto</div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#475569", marginBottom: "8px" }}>
            <span>📱</span><span>{cliente.celular}</span>
            <a href={"tel:" + cliente.celular} style={{ marginLeft: "auto", background: "#d1fae5", color: "#065f46", padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", textDecoration: "none" }}>Llamar</a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#475569" }}>
            <span>📍</span><span>{cliente.direccion}</span>
          </div>
        </div>

        {/* Hacer Credito Button */}
        <button onClick={() => navigate("/nuevo-credito/" + id)} style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #0d9488, #0f766e)", color: "#fff", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "16px", boxShadow: "0 4px 14px rgba(13,148,136,0.35)", fontFamily: "inherit" }}>
          + Hacer Credito
        </button>

        {/* Creditos List */}
        <div style={{ background: "#fff", borderRadius: "14px", padding: "18px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
            📄 Historial de Creditos
            {prestamos.length > 0 && <span style={{ background: "#f1f5f9", color: "#64748b", padding: "2px 8px", borderRadius: "20px", fontSize: "12px" }}>{prestamos.length}</span>}
          </div>
          {prestamos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>💳</div>
              <div style={{ fontSize: "14px" }}>Sin creditos registrados</div>
            </div>
          ) : prestamos.map(p => {
            const pct = p.totalAPagar > 0 ? Math.round((p.totalPagado / p.totalAPagar) * 100) : 0;
            const pagado = p.estado === "pagado";
            return (
              <div key={p._id} style={{ border: "1.5px solid #f1f5f9", borderRadius: "12px", padding: "14px", marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontSize: "17px", fontWeight: "700", color: "#1e293b" }}>{fmt(p.capital)}</div>
                  <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", background: pagado ? "#0d9488" : "#f1f5f9", color: pagado ? "#fff" : "#64748b" }}>{pct}%</span>
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "10px" }}>
                  {new Date(p.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                  {" · "}{p.interes}% interes
                </div>
                <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "4px", marginBottom: "6px", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: "4px", width: pct + "%", background: pagado ? "#22c55e" : "#0d9488", transition: "width 0.4s" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", marginBottom: "10px" }}>
                  <span>Pagado: {fmt(p.totalPagado)}</span>
                  <span>Restante: {fmt(p.totalAPagar - p.totalPagado)}</span>
                </div>
                {!pagado && (
                  <button onClick={() => navigate("/pagar/" + p._id)} style={{ width: "100%", padding: "11px", background: "#0d9488", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", fontFamily: "inherit" }}>
                    💵 Registrar Pago
                  </button>
                )}
                {pagado && (
                  <div style={{ textAlign: "center", padding: "8px", background: "#d1fae5", borderRadius: "8px", fontSize: "13px", fontWeight: "600", color: "#065f46" }}>
                    ✅ Credito Pagado Completamente
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
