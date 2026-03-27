import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { clientesAPI, prestamosAPI } from "../services/api";

const fmt = n => "$ " + Number(n || 0).toLocaleString("es-CO");

export default function ClienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el modal de nuevo crédito
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    capital: "",
    interes: "",
    plazo: "",
    fechaInicio: "",
    fechaVencimiento: ""
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Cargando cliente:', id);
        const cRes = await clientesAPI.getById(id);
        setCliente(cRes.data);
        
        console.log('Cargando préstamos del cliente:', id);
        const pRes = await prestamosAPI.getByCliente(id);
        setPrestamos(pRes.data || []);
        
      } catch (e) { 
        console.error('Error cargando datos:', e);
        setError(e.response?.data?.error || 'Error al cargar los datos');
      } finally { 
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleRegistrarPago = (prestamoId) => {
    console.log('Navegando a pagar con ID:', prestamoId);
    if (prestamoId && prestamoId !== 'undefined') {
      navigate(`/pagar/${prestamoId}`);
    } else {
      console.error('ID de préstamo no válido:', prestamoId);
      alert('Error: ID de préstamo no válido');
    }
  };

  // Función para crear un nuevo préstamo
  const handleCrearPrestamo = async () => {
    // Validar campos requeridos
    if (!formData.capital || !formData.plazo || !formData.fechaInicio || !formData.fechaVencimiento) {
      alert("Complete todos los campos requeridos (Capital, Plazo, Fecha Inicio, Fecha Vencimiento)");
      return;
    }

    setSaving(true);
    try {
      const data = {
        clienteId: id,
        capital: parseFloat(formData.capital),
        interes: parseFloat(formData.interes) || 0,
        plazo: parseInt(formData.plazo),
        fechaInicio: new Date(formData.fechaInicio).toISOString(),
        fechaVencimiento: new Date(formData.fechaVencimiento).toISOString()
      };

      const response = await prestamosAPI.create(data);
      console.log('Préstamo creado:', response.data);
      
      // Cerrar modal y recargar préstamos
      setShowModal(false);
      setFormData({ capital: "", interes: "", plazo: "", fechaInicio: "", fechaVencimiento: "" });
      
      // Recargar los préstamos
      const pRes = await prestamosAPI.getByCliente(id);
      setPrestamos(pRes.data || []);
      
      alert('✅ Crédito creado exitosamente');
    } catch (error) {
      console.error('Error al crear préstamo:', error);
      alert(error.response?.data?.error || 'Error al crear el crédito');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "80px 20px", color: "#94a3b8", fontSize: "16px" }}>Cargando...</div>;
  if (error) return <div style={{ textAlign: "center", padding: "80px 20px", color: "#ef4444", fontSize: "16px" }}>Error: {error}</div>;
  if (!cliente) return <div style={{ textAlign: "center", padding: "80px 20px", color: "#94a3b8" }}>Cliente no encontrado</div>;

  const totalPrestado = prestamos.reduce((s, p) => s + (p.capital || 0), 0);
  const totalPagado = prestamos.reduce((s, p) => s + (p.totalPagado || 0), 0);
  const activos = prestamos.filter(p => p.estado === "activo").length;

  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "14px",
    marginBottom: "12px",
    outline: "none",
    boxSizing: "border-box"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0d9488, #0f766e)", padding: "0 20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "16px", marginBottom: "20px" }}>
          <button onClick={() => navigate("/clientes")} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "10px", width: "36px", height: "36px", color: "#fff", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "inherit", cursor: "pointer" }}>←</button>
          <span style={{ fontSize: "17px", fontWeight: "700", color: "#fff" }}>Detalle del Cliente</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "56px", height: "56px", background: "rgba(255,255,255,0.2)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", border: "1.5px solid rgba(255,255,255,0.3)", flexShrink: 0 }}>👤</div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#fff" }}>{cliente.nombre}</div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>CC: {cliente.cedula}</div>
            <span style={{ display: "inline-block", marginTop: "4px", padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: "rgba(255,255,255,0.2)", color: "#fff" }}>{cliente.tipoCliente || 'regular'}</span>
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
            <span>📱</span><span>{cliente.celular || cliente.telefono || 'No registrado'}</span>
            {(cliente.celular || cliente.telefono) && (
              <a href={"tel:" + (cliente.celular || cliente.telefono)} style={{ marginLeft: "auto", background: "#d1fae5", color: "#065f46", padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", textDecoration: "none" }}>Llamar</a>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#475569" }}>
            <span>📍</span><span>{cliente.direccion || 'No registrada'}</span>
          </div>
        </div>

        {/* Hacer Credito Button */}
        <button onClick={() => setShowModal(true)} style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #0d9488, #0f766e)", color: "#fff", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "16px", boxShadow: "0 4px 14px rgba(13,148,136,0.35)", fontFamily: "inherit", cursor: "pointer" }}>
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
            const totalAPagar = p.totalAPagar || p.capital * (1 + (p.interes || 0) / 100);
            const totalPagado = p.totalPagado || 0;
            const pct = totalAPagar > 0 ? Math.round((totalPagado / totalAPagar) * 100) : 0;
            const pagado = p.estado === "pagado" || pct >= 100;
            return (
              <div key={p._id} style={{ border: "1.5px solid #f1f5f9", borderRadius: "12px", padding: "14px", marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontSize: "17px", fontWeight: "700", color: "#1e293b" }}>{fmt(p.capital)}</div>
                  <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", background: pagado ? "#0d9488" : "#f1f5f9", color: pagado ? "#fff" : "#64748b" }}>{pct}%</span>
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "10px" }}>
                  {new Date(p.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                  {" · "}{p.interes || 0}% interes
                  {" · "}{p.plazo || p.numeroCuotas || 0} cuotas
                </div>
                <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "4px", marginBottom: "6px", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: "4px", width: pct + "%", background: pagado ? "#22c55e" : "#0d9488", transition: "width 0.4s" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", marginBottom: "10px" }}>
                  <span>Pagado: {fmt(totalPagado)}</span>
                  <span>Restante: {fmt(totalAPagar - totalPagado)}</span>
                </div>
                {!pagado && (
                  <button 
                    onClick={() => handleRegistrarPago(p._id)} 
                    style={{ width: "100%", padding: "11px", background: "#0d9488", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", fontFamily: "inherit", cursor: "pointer" }}
                  >
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

      {/* Modal para crear nuevo crédito */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "24px", width: "90%", maxWidth: "450px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <span style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b" }}>Nuevo Crédito</span>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#94a3b8" }}>✕</button>
            </div>
            
            <label style={{ fontSize: "13px", fontWeight: "600", marginBottom: "4px", display: "block" }}>Capital *</label>
            <input type="number" style={inputStyle} placeholder="Monto del préstamo" value={formData.capital} onChange={e => setFormData({...formData, capital: e.target.value})} />
            
            <label style={{ fontSize: "13px", fontWeight: "600", marginBottom: "4px", display: "block" }}>Interés (%)</label>
            <input type="number" style={inputStyle} placeholder="Porcentaje de interés" value={formData.interes} onChange={e => setFormData({...formData, interes: e.target.value})} />
            
            <label style={{ fontSize: "13px", fontWeight: "600", marginBottom: "4px", display: "block" }}>Plazo (días) *</label>
            <input type="number" style={inputStyle} placeholder="Días para pagar" value={formData.plazo} onChange={e => setFormData({...formData, plazo: e.target.value})} />
            
            <label style={{ fontSize: "13px", fontWeight: "600", marginBottom: "4px", display: "block" }}>Fecha Inicio *</label>
            <input type="date" style={inputStyle} value={formData.fechaInicio} onChange={e => setFormData({...formData, fechaInicio: e.target.value})} />
            
            <label style={{ fontSize: "13px", fontWeight: "600", marginBottom: "4px", display: "block" }}>Fecha Vencimiento *</label>
            <input type="date" style={inputStyle} value={formData.fechaVencimiento} onChange={e => setFormData({...formData, fechaVencimiento: e.target.value})} />
            
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "12px", background: "#f1f5f9", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", color: "#64748b" }}>Cancelar</button>
              <button onClick={handleCrearPrestamo} disabled={saving} style={{ flex: 1, padding: "12px", background: "#0d9488", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", color: "#fff" }}>
                {saving ? "Creando..." : "Crear Crédito"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}