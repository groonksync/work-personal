import React, { useState } from 'react';
import { 
  X, Plus, DollarSign, Calendar, User, Phone, 
  Percent, Clock, Calculator, Check 
} from 'lucide-react';

export default function NewLoanModal({ isOpen, onClose, onSave, currency = 'BOB' }) {
  if (!isOpen) return null;

  const [tipo, setTipo] = useState('otorgado'); // 'otorgado' vs 'recibido'
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [ci, setCi] = useState('');
  const [capital, setCapital] = useState(1000);
  const [interes, setInteres] = useState(10);
  const [plazoMeses, setPlazoMeses] = useState(6);
  const [tipoPago, setTipoPago] = useState('mensual');
  const [notas, setNotas] = useState('');

  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';
  
  const capitalNum = parseFloat(capital) || 0;
  const interesNum = parseFloat(interes) || 0;
  const mesesNum = parseInt(plazoMeses) || 6;
  const cuotaEstimada = Math.round((capitalNum / mesesNum) + (capitalNum * (interesNum / 100)));
  const totalRendimientoEstimado = Math.round(capitalNum * (interesNum / 100) * mesesNum);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return alert('Por favor ingresa el nombre de la persona');

    const hoy = new Date().toISOString().split('T')[0];
    const fin = new Date(Date.now() + mesesNum * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

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
      inicio: hoy,
      fin,
      estado: 'Activo',
      pagos: [],
      notas: notas.trim() ? `[TIPO:${tipo}] ${notas.trim()}` : `[TIPO:${tipo}] Registrado en Work Personal`,
    };

    onSave(newLoan);
    onClose();
  };

  const addAmount = (amt) => {
    setCapital((prev) => parseFloat(prev || 0) + amt);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-[#2e2e2e] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-zinc-900 dark:text-[#ececec] max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-4 px-5 border-b border-zinc-200 dark:border-[#2e2e2e] flex items-center justify-between bg-zinc-50 dark:bg-[#181818]">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight leading-none">
              Anotar Nuevo Préstamo
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-[#8e8e8e] mt-1">
              Crea un nuevo expediente y plan de cuotas automático
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-200/70 hover:bg-zinc-200 dark:bg-[#262626] dark:hover:bg-[#333] text-zinc-500 hover:text-zinc-900 dark:text-[#a3a3a3] dark:hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto custom-scroll text-xs">
          
          {/* Segmento: Otorgado vs Recibido */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 dark:bg-[#262626] border border-zinc-200 dark:border-[#383838] rounded-xl">
            <button
              type="button"
              onClick={() => setTipo('otorgado')}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                tipo === 'otorgado'
                  ? 'bg-white dark:bg-[#333333] text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 dark:text-[#8e8e8e]'
              }`}
            >
              Yo presto (Cobro)
            </button>
            <button
              type="button"
              onClick={() => setTipo('recibido')}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                tipo === 'recibido'
                  ? 'bg-white dark:bg-[#333333] text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 dark:text-[#8e8e8e]'
              }`}
            >
              Me prestan (Acreedor)
            </button>
          </div>

          {/* Nombre y Contacto */}
          <div className="space-y-2.5">
            <div>
              <label className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-[#8e8e8e] block mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Roberto Villazón"
                className="w-full bg-zinc-50 dark:bg-[#262626] border border-zinc-200 dark:border-[#383838] px-3 py-2 rounded-lg text-zinc-900 dark:text-white outline-none focus:border-zinc-400 dark:focus:border-[#555] text-xs"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-[#8e8e8e] block mb-1">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej. 76653981"
                  className="w-full bg-zinc-50 dark:bg-[#262626] border border-zinc-200 dark:border-[#383838] px-3 py-2 rounded-lg text-zinc-900 dark:text-white outline-none text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-[#8e8e8e] block mb-1">
                  CI / Identificación
                </label>
                <input
                  type="text"
                  value={ci}
                  onChange={(e) => setCi(e.target.value)}
                  placeholder="Ej. 6259284 LP"
                  className="w-full bg-zinc-50 dark:bg-[#262626] border border-zinc-200 dark:border-[#383838] px-3 py-2 rounded-lg text-zinc-900 dark:text-white outline-none text-xs"
                />
              </div>
            </div>
          </div>

          {/* Monto Capital */}
          <div className="space-y-1.5 p-3 rounded-xl bg-zinc-50 dark:bg-[#262626] border border-zinc-200 dark:border-[#383838]">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-[#8e8e8e]">
                Monto Capital ({symbol})
              </label>
              <span className="text-[10px] font-mono text-zinc-400 dark:text-[#737373]">
                Moneda: {currency}
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                required
                min="1"
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                className="w-full bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-[#383838] px-3 py-2.5 rounded-lg text-base font-mono font-bold text-zinc-900 dark:text-white outline-none"
              />
            </div>

            {/* Chips rápidos de suma */}
            <div className="flex gap-1.5 pt-1">
              {[500, 1000, 2500, 5000].map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => addAmount(amt)}
                  className="py-1 px-2 rounded-md bg-zinc-200/60 dark:bg-[#1e1e1e] hover:bg-zinc-200 dark:hover:bg-[#333] text-[10px] font-mono font-semibold text-zinc-700 dark:text-[#a3a3a3] flex-1 border border-zinc-300/40 dark:border-[#333] transition-all"
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Tasa y Plazo */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-[#8e8e8e] block mb-1">
                Tasa de Interés (%)
              </label>
              <input
                type="number"
                value={interes}
                onChange={(e) => setInteres(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-[#262626] border border-zinc-200 dark:border-[#383838] px-3 py-2 rounded-lg text-zinc-900 dark:text-white font-mono outline-none text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-[#8e8e8e] block mb-1">
                Plazo (Meses)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={plazoMeses}
                onChange={(e) => setPlazoMeses(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-[#262626] border border-zinc-200 dark:border-[#383838] px-3 py-2 rounded-lg text-zinc-900 dark:text-white font-mono outline-none text-xs"
              />
            </div>
          </div>

          {/* Notas u Observaciones */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-[#8e8e8e] block mb-1">
              Garantía / Cláusulas
            </label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej. Garantía de equipo portátil, pagaré firmado..."
              className="w-full bg-zinc-50 dark:bg-[#262626] border border-zinc-200 dark:border-[#383838] p-2.5 rounded-lg text-zinc-900 dark:text-white outline-none resize-none text-xs"
            />
          </div>

          {/* Simulación en vivo */}
          <div className="p-3 rounded-xl bg-zinc-100 dark:bg-[#262626] border border-zinc-200 dark:border-[#333333] flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-zinc-500 dark:text-[#8e8e8e] block">Cuota Mensual Estimada</span>
              <strong className="text-base font-mono font-bold text-zinc-900 dark:text-white">
                {symbol} {cuotaEstimada.toLocaleString()}
              </strong>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-zinc-500 dark:text-[#8e8e8e] block">Rendimiento Total</span>
              <strong className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                +{symbol} {totalRendimientoEstimado.toLocaleString()}
              </strong>
            </div>
          </div>

          {/* Footer de Acciones */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-[#2e2e2e]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#262626] dark:hover:bg-[#333] text-xs font-medium text-zinc-700 dark:text-[#d4d4d4] transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Registrar Préstamo</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
