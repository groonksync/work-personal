import React, { useState } from 'react';
import { 
  X, Calendar, Clock, ArrowRight, Check, AlertTriangle, 
  FileText, ShieldCheck, Sparkles, TrendingUp
} from 'lucide-react';
import { toDate, formatDate } from '../lib/amortizacion';

export default function ContractExtensionModal({
  isOpen,
  onClose,
  loan,
  currency = 'BOB',
  onConfirmExtension,
}) {
  if (!isOpen || !loan) return null;

  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';
  const plazoActual = parseInt(loan.plazo_meses) || 6;
  const [mesesExtra, setMesesExtra] = useState(1);
  const [nuevaTasa, setNuevaTasa] = useState(loan.interes || 10);
  const [motivo, setMotivo] = useState('Prórroga acordada con el cliente');

  // Calcular nueva fecha fin
  const fechaFinActual = loan.fin || formatDate(new Date());
  const finDate = toDate(fechaFinActual);
  const nuevaFinDate = new Date(finDate.getFullYear(), finDate.getMonth() + parseInt(mesesExtra), finDate.getDate());
  const nuevaFechaFinStr = formatDate(nuevaFinDate);
  const nuevoPlazoTotal = plazoActual + parseInt(mesesExtra);

  // Rendimiento adicional estimado
  const cap = parseFloat(loan.capital) || 0;
  const tasaNum = parseFloat(nuevaTasa) || 0;
  const interesExtraTotal = Math.round(cap * (tasaNum / 100) * parseInt(mesesExtra));

  const handleConfirm = () => {
    if (mesesExtra <= 0) {
      alert('Debes seleccionar al menos 1 mes adicional.');
      return;
    }

    const payload = {
      loanId: loan.id,
      nuevoPlazoMeses: nuevoPlazoTotal,
      nuevaFechaFin: nuevaFechaFinStr,
      nuevaTasa: tasaNum,
      mesesAgregados: parseInt(mesesExtra),
      motivo: motivo.trim(),
      fechaRegistro: new Date().toISOString(),
      interesExtraGenerado: interesExtraTotal,
    };

    onConfirmExtension(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-[#2e2e2e] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-zinc-900 dark:text-[#ececec] max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-4 px-5 border-b border-zinc-200 dark:border-[#2e2e2e] flex items-center justify-between bg-zinc-50 dark:bg-[#181818]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight leading-none">
                Extensión y Prórroga de Contrato
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-[#8e8e8e] mt-1">
                Expediente: <strong>{loan.nombre}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-zinc-200/70 hover:bg-zinc-200 dark:bg-[#262626] dark:hover:bg-[#333] text-zinc-500 hover:text-zinc-900 dark:text-[#a3a3a3] dark:hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scroll text-xs">
          
          {/* Comparativa Visual Antes vs Después */}
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#262626] border border-zinc-200 dark:border-[#383838] space-y-2">
            <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-[#8e8e8e]">
              <span>Plazo Actual:</span>
              <strong className="text-zinc-800 dark:text-white font-mono">{plazoActual} meses ({fechaFinActual})</strong>
            </div>
            
            <div className="flex items-center justify-center py-1 text-zinc-400">
              <ArrowRight className="w-4 h-4 rotate-90 sm:rotate-0" />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Nuevo Plazo Extendido:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                {nuevoPlazoTotal} meses ({nuevaFechaFinStr})
              </strong>
            </div>
          </div>

          {/* Opciones de extensión rápida */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-700 dark:text-[#d4d4d4] block">
              Tiempo Adicional a Conceder
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 6].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMesesExtra(m)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    mesesExtra === m
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-[#262626] text-zinc-700 dark:text-[#a3a3a3] border-zinc-200 dark:border-[#383838] hover:bg-zinc-200 dark:hover:bg-[#303030]'
                  }`}
                >
                  +{m} {m === 1 ? 'Mes' : 'Meses'}
                </button>
              ))}
            </div>
          </div>

          {/* Ajuste de Tasa de Interés */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-[#d4d4d4] block">
                Tasa Mensual (%)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={nuevaTasa}
                onChange={(e) => setNuevaTasa(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-[#262626] border border-zinc-200 dark:border-[#383838] rounded-xl px-3 py-2 text-zinc-900 dark:text-white font-mono text-xs outline-none focus:border-zinc-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-[#d4d4d4] block">
                Ganancia Adicional
              </label>
              <div className="w-full bg-zinc-100 dark:bg-[#262626] border border-zinc-200 dark:border-[#383838] rounded-xl px-3 py-2 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs">
                +{symbol} {interesExtraTotal.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Motivo o Acuerdo de la Prórroga */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-700 dark:text-[#d4d4d4] block">
              Motivo o Acuerdo de la Prórroga
            </label>
            <textarea
              rows="2"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Detalles de la renegociación o prórroga..."
              className="w-full bg-zinc-100 dark:bg-[#262626] border border-zinc-200 dark:border-[#383838] rounded-xl p-3 text-zinc-900 dark:text-white text-xs outline-none focus:border-zinc-400 custom-scroll"
            />
          </div>

          {/* Aviso informativo */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-start gap-2 text-[11px] leading-relaxed">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Al confirmar, se actualizará la fecha de vencimiento y se añadirán automáticamente las nuevas cuotas al cronograma manteniendo el historial previo intacto.
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 px-5 border-t border-zinc-200 dark:border-[#2e2e2e] flex items-center justify-end gap-2.5 bg-zinc-50 dark:bg-[#181818]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-[#a3a3a3] hover:bg-zinc-200/60 dark:hover:bg-[#262626] transition-all"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Confirmar Extensión (+{mesesExtra}m)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
