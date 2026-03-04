import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { prestamosAPI, pagosAPI } from '../services/api';

const fmt = n => `$ ${Number(n || 0).toLocaleString('es-CO')}`;

const s = {
  page: { minHeight: '100vh', background: '#f1f5f9' },
  header: { background: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #e2e8f0' },
  backBtn: { background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer' },
  headerTitle: { fontSize: '18px', fontWeight: '700', color: '#1e293b' },
  content: { padding: '20px' },
  prestamoCard: { background: '#fff', borderRadius: '14px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  row: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#374151', marginBottom: '8px' },
  progressBar: { height: '8px', background: '#f1f5f9', borderRadius: '4px', margin: '12px 0 6px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '4px', background: '#0d9488' },
  form: { background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '16px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
  input: { width: '100%', padding: '13px 16px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', marginBottom: '16px', outline: 'none' },
  quickBtns: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
  quickBtn: { padding: '8px 12px', border: '1.5px solid #0d9488', borderRadius: '8px', background: '#fff', color: '#0d9488', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  saveBtn: { width: '100%', padding: '15px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' },
  historial: { background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  histTitle: { fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '14px' },
  pagoItem: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: '14px' },
  success: { background: '#d1fae5', border: '1.5px solid #bbf7d0', borderRadius: '12px', padding: '16px', marginBottom: '16px', textAlign: 'center', color: '#065f46', fontWeight: '600' },
};

export default function PagarCredito() {
  const { prestamoId } = useParams();
  const navigate = useNavigate();
  const [prestamo, setPrestamo] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [monto, setMonto] = useState('');
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const load = async () => {
    const [pRes, pgRes] = await Promise.all([
      prestamosAPI.getAll(),
      pagosAPI.getByPrestamo(prestamoId)
    ]);
    const p = pRes.data.find(x => x._id === prestamoId);
    setPrestamo(p);
    setPagos(pgRes.data);
  };

  useEffect(() => { load(); }, [prestamoId]);

  const handlePagar = async () => {
    const montoNum = parseFloat(monto);
    if (!montoNum || montoNum <= 0) return alert('Ingrese un monto válido');
    setSaving(true);
    try {
      await pagosAPI.create({ prestamoId, monto: montoNum, notas });
      setMonto(''); setNotas('');
      setSuccess(`Pago de ${fmt(montoNum)} registrado exitosamente`);
      setTimeout(() => setSuccess(''), 3000);
      await load();
    } catch (e) { alert(e.response?.data?.error || 'Error al registrar pago'); }
    finally { setSaving(false); }
  };

  if (!prestamo) return <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Cargando...</div>;

  const restante = prestamo.totalAPagar - prestamo.totalPagado;
  const pct = prestamo.totalAPagar > 0 ? Math.round((prestamo.totalPagado / prestamo.totalAPagar) * 100) : 0;
  const cuotaSugerida = prestamo.numeroCuotas > 0 ? Math.round(prestamo.totalAPagar / prestamo.numeroCuotas) : 0;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate(-1)}>←</button>
        <span style={s.headerTitle}>Registrar Pago</span>
      </div>
      <div style={s.content}>
        {success && <div style={s.success}>✅ {success}</div>}
        <div style={s.prestamoCard}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>{prestamo.cliente?.nombre}</div>
          <div style={s.row}><span>Capital:</span><span>{fmt(prestamo.capital)}</span></div>
          <div style={s.row}><span>Total a pagar:</span><span>{fmt(prestamo.totalAPagar)}</span></div>
          <div style={s.row}><span>Total pagado:</span><span style={{ color: '#22c55e', fontWeight: '600' }}>{fmt(prestamo.totalPagado)}</span></div>
          <div style={s.row}><span>Restante:</span><span style={{ color: '#ef4444', fontWeight: '700' }}>{fmt(restante)}</span></div>
          <div style={s.progressBar}><div style={{ ...s.progressFill, width: `${pct}%` }} /></div>
          <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'right' }}>{pct}% pagado</div>
        </div>

        {prestamo.estado === 'activo' && (
          <div style={s.form}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>Registrar Pago</div>
            <label style={s.label}>Monto a pagar ($)</label>
            <input style={s.input} type="number" placeholder="Ingrese monto" value={monto} onChange={e => setMonto(e.target.value)} />
            <div style={s.quickBtns}>
              <button style={s.quickBtn} onClick={() => setMonto(cuotaSugerida.toString())}>Cuota {fmt(cuotaSugerida)}</button>
              <button style={s.quickBtn} onClick={() => setMonto(restante.toString())}>Pagar todo {fmt(restante)}</button>
            </div>
            <label style={s.label}>Notas (opcional)</label>
            <input style={s.input} placeholder="Observaciones..." value={notas} onChange={e => setNotas(e.target.value)} />
            <button style={s.saveBtn} onClick={handlePagar} disabled={saving}>{saving ? 'Registrando...' : '💵 Registrar Pago'}</button>
          </div>
        )}

        <div style={s.historial}>
          <div style={s.histTitle}>Historial de Pagos ({pagos.length})</div>
          {pagos.length === 0 ? <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Sin pagos registrados</div> :
            pagos.map(pg => (
              <div key={pg._id} style={s.pagoItem}>
                <div>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>{fmt(pg.monto)}</div>
                  {pg.notas && <div style={{ fontSize: '12px', color: '#94a3b8' }}>{pg.notas}</div>}
                </div>
                <div style={{ color: '#64748b', fontSize: '13px' }}>{new Date(pg.fechaPago).toLocaleDateString('es-CO')}</div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
