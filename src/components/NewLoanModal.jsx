import React, { useState } from 'react';
import { X, Plus, DollarSign, Calendar, User, Phone } from 'lucide-react';

export default function NewLoanModal({ isOpen, onClose, onSave, currency }) {
  if (!isOpen) return null;

  const [tipo, setTipo] = useState('otorgado'); // 'otorgado' vs 'recibido'
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [ci, setCi] = useState('');
  const [capital, setCapital] = useState(1000);
  const [interes, setInteres] = useState(5);
  const [plazoMeses, setPlazoMeses] = useState(6);
  const [frecuencia, setFrecuencia] = useState('mensual');
  const [tipoPago, setTipoPago] = useState('mensual');

  const symbol = currency === 'BOB' ? 'Bs. ' : currency === 'PEN' ? 'S/ ' : '$ ';
  const cuotaEstimada = Math.round((capital / plazoMeses) + (capital * (interes / 100)));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return alert('Por favor ingresa el nombre de la persona');

    const hoy = new Date().toISOString().split('T')[0];
    const fin = new Date(Date.now() + plazoMeses * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newLoan = {
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      ci: ci.trim(),
      capital: parseFloat(capital) || 0,
      interes: parseFloat(interes) || 0,
      plazo_meses: parseInt(plazoMeses) || 6,
      tipo_prestamo: tipo,
      tipo_pago: tipoPago,
      moneda: currency,
      inicio: hoy,
      fin,
      estado: 'Activo',
      pagos: [],
      notas: `[TIPO:${tipo}] Creado desde Work Personal`,
    };

    onSave(newLoan);
    onClose();
  };

  const addAmount = (amt) => {
    setCapital((prev) => parseFloat(prev || 0) + amt);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md card-base p-6 space-y-4 shadow-2xl bg-[var(--bg-surface)]">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-fine)]">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-main)]">Anotar Préstamo Nuevo</h3>
            <p className="text-xs text-[var(--text-muted)]">Crea una nueva carpeta y plan de pagos</p>
          </div>
          <button
            onClick={onClose}
            className="btn-base h-8 w-8 p-0 card-base bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Segmento: Otorgado vs Recibido */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[var(--bg-subtle)] border border-[var(--border-fine)] rounded-lg">
            <button
              type="button"
              onClick={() => setTipo('otorgado')}
              className={`btn-base h-8 rounded-lg ${
                tipo === 'otorgado'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-main)] font-semibold shadow-xs'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              Yo le presto dinero
            </button>
            <button
              type="button"
              onClick={() => setTipo('recibido')}
              className={`btn-base h-8 rounded-lg ${
                tipo === 'recibido'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-main)] font-semibold shadow-xs'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              Prestamista me presta
            </button>
          </div>

          {/* Nombre y Teléfono */}
          <div className="space-y-2">
            <div>
              <label className="text-xs font-medium text-[var(--text-main)] block mb-1">
                Nombre de la Persona
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Roberto Gómez"
                className="w-full card-base bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-main)] outline-none rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-[var(--text-main)] block mb-1">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej. 70012345"
                  className="w-full card-base bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-main)] outline-none rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-main)] block mb-1">
                  CI / Identificación
                </label>
                <input
                  type="text"
                  value={ci}
                  onChange={(e) => setCi(e.target.value)}
                  placeholder="Ej. 8492019 LP"
                  className="w-full card-base bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-main)] outline-none rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Monto Capital con botones rápidos */}
          <div>
            <label className="text-xs font-medium text-[var(--text-main)] block mb-1">
              Monto Capital ({symbol})
            </label>
            <input
              type="number"
              required
              min="1"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              className="w-full card-base bg-[var(--bg-canvas)] px-3 py-2 text-sm font-mono font-bold text-[var(--text-main)] outline-none rounded-lg mb-1.5"
            />
            <div className="flex gap-1.5">
              {[500, 1000, 2500, 5000].map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => addAmount(amt)}
                  className="btn-base h-7 px-2 card-base bg-[var(--bg-subtle)] text-[11px] text-[var(--text-muted)] hover:text-[var(--text-main)] flex-1"
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Interés y Plazo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--text-main)] block mb-1">
                Tasa de Interés (%)
              </label>
              <input
                type="number"
                value={interes}
                onChange={(e) => setInteres(e.target.value)}
                className="w-full card-base bg-[var(--bg-canvas)] px-3 py-2 text-xs font-mono text-[var(--text-main)] outline-none rounded-lg"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-main)] block mb-1">
                Plazo (Meses / Cuotas)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={plazoMeses}
                onChange={(e) => setPlazoMeses(e.target.value)}
                className="w-full card-base bg-[var(--bg-canvas)] px-3 py-2 text-xs font-mono text-[var(--text-main)] outline-none rounded-lg"
              />
            </div>
          </div>

          {/* Resumen Calculado */}
          <div className="p-3 rounded-lg card-base bg-[var(--bg-subtle)] flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)]">Cuota estimada mensual:</span>
            <span className="font-mono font-bold text-[var(--badge-warn)] text-sm">
              {symbol}{cuotaEstimada.toLocaleString()}
            </span>
          </div>

          <div className="pt-2 border-t border-[var(--border-fine)]">
            <button
              type="submit"
              className="btn-base w-full bg-[var(--btn-solid)] text-[var(--btn-solid-fg)] font-semibold"
            >
              Guardar y Crear Carpeta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
