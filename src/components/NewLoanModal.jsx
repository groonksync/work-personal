import React, { useState, useEffect } from 'react';
import { 
  X, Plus, DollarSign, Calendar, User, Phone, 
  Percent, Clock, Calculator, Check, HardDrive, Shield
} from 'lucide-react';

export default function NewLoanModal({ 
  isOpen, 
  onClose, 
  onSave, 
  currency = 'BOB',
  prefill = null,
}) {
  if (!isOpen) return null;

  const [tipo, setTipo] = useState('otorgado'); // 'otorgado' vs 'recibido'
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [ci, setCi] = useState('');
  const [capital, setCapital] = useState(prefill?.capital || 1000);
  const [interes, setInteres] = useState(prefill?.interes || 10);
  const [plazoMeses, setPlazoMeses] = useState(prefill?.plazo_meses || 6);
  const [tipoPago, setTipoPago] = useState(prefill?.tipo_pago || 'mensual');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [driveUrl, setDriveUrl] = useState('');
  const [garantia, setGarantia] = useState('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    if (prefill) {
      if (prefill.capital) setCapital(prefill.capital);
      if (prefill.interes) setInteres(prefill.interes);
      if (prefill.plazo_meses) setPlazoMeses(prefill.plazo_meses);
      if (prefill.tipo_pago) setTipoPago(prefill.tipo_pago);
    }
  }, [prefill]);

  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';
  
  const capitalNum = parseFloat(capital) || 0;
  const interesNum = parseFloat(interes) || 0;
  const mesesNum = parseInt(plazoMeses) || 6;

  // Cálculo de cuota estimada
  const cuotaEstimada = tipoPago === 'diario'
    ? Math.round(((capitalNum / (mesesNum * 30)) + (capitalNum * (interesNum / 100) * mesesNum / (mesesNum * 30))) * 100) / 100
    : Math.round((capitalNum / mesesNum) + (capitalNum * (interesNum / 100)));

  const totalRendimientoEstimado = Math.round(capitalNum * (interesNum / 100) * mesesNum);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return alert('Por favor ingresa el nombre de la persona');

    const inicioDate = new Date(fechaInicio);
    const finDate = new Date(inicioDate);
    finDate.setMonth(finDate.getMonth() + mesesNum);
    const fin = finDate.toISOString().split('T')[0];

    const newLoan = {
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      ci: ci.trim(),
      capital: capitalNum,
      interes: interesNum,
      plazo_meses: mesesNum,
      tipo_prestamo: tipo,
      tipo_pago: tipoPago,
      moneda: currency,
      inicio: fechaInicio,
      fin,
      estado: 'Activo',
      pagos: [],
      drive_url: driveUrl.trim() || null,
      drive_contrato: driveUrl.trim() || null,
      garantia: garantia.trim() || null,
      notas: notas.trim() ? `[TIPO:${tipo}] ${notas.trim()}` : `[TIPO:${tipo}] Registrado en Work Personal`,
    };

    onSave(newLoan);
    onClose();
  };

  const addAmount = (amt) => {
    setCapital((prev) => parseFloat(prev || 0) + amt);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-[#151619] border border-[#222327] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-4 px-5 border-b border-[#222327] flex items-center justify-between bg-[#111215]">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight leading-none">
              Anotar Nuevo Préstamo
            </h3>
            <p className="text-[11px] text-[#8b8f98] mt-1">
              Crea un nuevo expediente con plan de cuotas automático y enlace de Drive
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1b1c20] hover:bg-[#222329] border border-[#26282e] text-[#8b8f98] hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto custom-scroll text-xs">
          
          {/* Segmento: Otorgado vs Recibido */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#111215] border border-[#222327] rounded-xl">
            <button
              type="button"
              onClick={() => setTipo('otorgado')}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                tipo === 'otorgado'
                  ? 'bg-[#2563eb] text-white shadow-xs'
                  : 'text-[#8b8f98] hover:text-white'
              }`}
            >
              Yo presto (Cobro)
            </button>
            <button
              type="button"
              onClick={() => setTipo('recibido')}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                tipo === 'recibido'
                  ? 'bg-[#2563eb] text-white shadow-xs'
                  : 'text-[#8b8f98] hover:text-white'
              }`}
            >
              Me prestan (Pago Acreedor)
            </button>
          </div>

          {/* Modalidad de pago: Mensual, Quincenal, Semanal, Diario */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
              Modalidad de Cobro / Retorno
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-[#111215] border border-[#222327] rounded-xl">
              {[
                { id: 'mensual', label: 'Mensual' },
                { id: 'quincenal', label: 'Quincenal' },
                { id: 'semanal', label: 'Semanal' },
                { id: 'diario', label: 'Diario' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setTipoPago(m.id)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    tipoPago === m.id
                      ? 'bg-[#2563eb] text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Datos Personales */}
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                Nombre de la Persona *
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Magali Molina, Roberto Villazón..."
                className="w-full bg-[#1b1c20] border border-[#26282e] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#2563eb] transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Cédula de Identidad (CI)
                </label>
                <input
                  type="text"
                  value={ci}
                  onChange={(e) => setCi(e.target.value)}
                  placeholder="Ej. 6259284-SC"
                  className="w-full bg-[#1b1c20] border border-[#26282e] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#2563eb] transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej. 76653981"
                  className="w-full bg-[#1b1c20] border border-[#26282e] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#2563eb] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Términos Financieros */}
          <div className="p-3.5 rounded-xl bg-[#111215] border border-[#222327] space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-zinc-400">
                  Monto del Capital ({symbol})
                </label>
                <span className="font-mono text-xs font-bold text-white">
                  {symbol} {capitalNum.toLocaleString()}
                </span>
              </div>
              <input
                type="number"
                step="100"
                required
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                className="w-full bg-[#1b1c20] border border-[#26282e] rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-[#2563eb] transition-colors"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                {[+500, +1000, +5000, +10000, +25000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => addAmount(amt)}
                    className="px-2 py-0.5 rounded-lg bg-[#1b1c20] hover:bg-[#2563eb] hover:text-white border border-[#26282e] text-[10px] font-mono text-zinc-300 transition-colors"
                  >
                    +{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Tasa Mensual (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={interes}
                  onChange={(e) => setInteres(e.target.value)}
                  className="w-full bg-[#1b1c20] border border-[#26282e] rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-[#2563eb] transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Plazo ({tipoPago === 'diario' ? 'Meses (x30d)' : 'Meses'})
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  required
                  value={plazoMeses}
                  onChange={(e) => setPlazoMeses(e.target.value)}
                  className="w-full bg-[#1b1c20] border border-[#26282e] rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-[#2563eb] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full bg-[#1b1c20] border border-[#26282e] rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-[#2563eb] transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  Garantía (Opcional)
                </label>
                <input
                  type="text"
                  value={garantia}
                  onChange={(e) => setGarantia(e.target.value)}
                  placeholder="Ej. Vehículo, Documento..."
                  className="w-full bg-[#1b1c20] border border-[#26282e] rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#2563eb] transition-colors"
                />
              </div>
            </div>

            {/* Resumen Calculado */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#222327] text-xs">
              <div>
                <span className="text-[10px] text-[#8b8f98] block">
                  Cuota {tipoPago === 'diario' ? 'Diaria' : 'Mensual'}:
                </span>
                <strong className="text-white font-mono">
                  {symbol} {cuotaEstimada.toLocaleString()}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-[#8b8f98] block">Ganancia Total:</span>
                <strong className="text-emerald-400 font-mono">
                  +{symbol} {totalRendimientoEstimado.toLocaleString()}
                </strong>
              </div>
            </div>
          </div>

          {/* Enlace de Google Drive */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#3b82f6] flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Enlace a Carpeta o Contrato en Google Drive (Opcional)</span>
            </label>
            <input
              type="url"
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="w-full bg-[#1b1c20] border border-[#26282e] rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-[#2563eb] transition-colors"
            />
          </div>

          {/* Notas y Observaciones */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-400 block">
              Notas u Observaciones del Contrato
            </label>
            <textarea
              rows="2"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Observaciones de fondeo, acuerdos o cláusulas..."
              className="w-full bg-[#1b1c20] border border-[#26282e] rounded-xl p-3 text-white text-xs outline-none focus:border-[#2563eb] custom-scroll transition-colors"
            />
          </div>

          {/* Footer de Acciones */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#222327]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-[#1b1c20] transition-all"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Guardar Préstamo</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
