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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-[#151619] border border-[#222327] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-4 px-5 border-b border-[#222327] flex items-center justify-between bg-[#111215]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb]/10 border border-[#2563eb]/20 text-[#3b82f6] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight leading-none">
                Extensión y Prórroga de Contrato
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1">
                Expediente: <strong className="text-white">{loan.nombre}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[#1b1c20] hover:bg-[#202126] text-zinc-400 hover:text-white flex items-center justify-center transition-colors border border-[#222327]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scroll text-xs">
          
          {/* Comparativa Visual Antes vs Después */}
          <div className="p-3.5 rounded-xl bg-[#1b1c20] border border-[#222327] space-y-2">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>Plazo Actual:</span>
              <strong className="text-zinc-200 font-mono">{plazoActual} meses ({fechaFinActual})</strong>
            </div>
            
            <div className="flex items-center justify-center py-1 text-zinc-500">
              <ArrowRight className="w-4 h-4 rotate-90 sm:rotate-0" />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-semibold">Nuevo Plazo Extendido:</span>
              <strong className="text-emerald-400 font-mono text-sm">
                {nuevoPlazoTotal} meses ({nuevaFechaFinStr})
              </strong>
            </div>
          </div>

          {/* Opciones de extensión rápida */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-300 block">
              Tiempo Adicional a Conceder
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 6].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMesesExtra(m)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    mesesExtra === m
                      ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-xs'
                      : 'bg-[#1b1c20] text-zinc-400 border-[#222327] hover:text-white hover:bg-[#202126]'
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
              <label className="text-[11px] font-semibold text-zinc-300 block">
                Tasa Mensual (%)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={nuevaTasa}
                onChange={(e) => setNuevaTasa(e.target.value)}
                className="w-full bg-[#111215] border border-[#222327] focus:border-[#2563eb] rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-300 block">
                Ganancia Adicional
              </label>
              <div className="w-full bg-[#111215] border border-[#222327] rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold text-xs">
                +{symbol} {interesExtraTotal.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Motivo o Acuerdo de la Prórroga */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-300 block">
              Motivo o Acuerdo de la Prórroga
            </label>
            <textarea
              rows="2"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Detalles de la renegociación o prórroga..."
              className="w-full bg-[#111215] border border-[#222327] focus:border-[#2563eb] rounded-xl p-3 text-white text-xs outline-none custom-scroll"
            />
          </div>

          {/* Aviso informativo */}
          <div className="p-3 rounded-xl bg-[#1b1c20] border border-[#222327] text-amber-400/90 flex items-start gap-2 text-[11px] leading-relaxed">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <span>
              Al confirmar, se actualizará la fecha de vencimiento y se añadirán automáticamente las nuevas cuotas al cronograma manteniendo el historial previo intacto.
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 px-5 border-t border-[#222327] flex items-center justify-end gap-2.5 bg-[#111215]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#1b1c20] hover:bg-[#202126] border border-[#222327] transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors active:scale-[0.98]"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Confirmar Extensión (+{mesesExtra}m)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
