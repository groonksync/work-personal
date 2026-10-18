import React, { useState } from 'react';
import { 
  X, Calculator, DollarSign, Calendar, TrendingUp, 
  ArrowRight, Plus, RefreshCw, CheckCircle2, Percent, Sliders
} from 'lucide-react';
import { simularPrestamo } from '../lib/amortizacion';

export default function LoanSimulatorModal({
  isOpen,
  onClose,
  currency = 'BOB',
  onApplySimulationToNewLoan,
}) {
  if (!isOpen) return null;

  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';

  const [capital, setCapital] = useState(5000);
  const [interes, setInteres] = useState(10);
  const [plazo, setPlazo] = useState(6);
  const [tipoPago, setTipoPago] = useState('mensual'); // 'mensual' | 'diario'

  const simulacion = simularPrestamo({
    capital,
    interes,
    plazo,
    tipoPago,
  });

  const addCapital = (amount) => {
    setCapital((prev) => Math.max(100, parseFloat(prev || 0) + amount));
  };

  const handleApply = () => {
    if (onApplySimulationToNewLoan) {
      onApplySimulationToNewLoan({
        capital,
        interes,
        plazo_meses: plazo,
        tipo_pago: tipoPago,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-[#141518] border border-[#24252a] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#f3f4f6] max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-4 px-5 border-b border-[#202126] flex items-center justify-between bg-[#0d0e11]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#22242b] border border-white/10 text-white flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight leading-none">
                Simulador & Calculadora Financiera
              </h3>
              <p className="text-[11px] text-[#8b8f98] mt-1">
                Proyecta cuotas, rendimientos y ganancias netas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[#1c1d22] hover:bg-[#25272e] text-[#8b8f98] hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scroll text-xs">
          
          {/* Selector de Modalidad */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0d0e11] border border-[#202126] rounded-xl">
            <button
              type="button"
              onClick={() => setTipoPago('mensual')}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                tipoPago === 'mensual'
                  ? 'bg-[#22242b] text-white shadow-xs border border-white/10'
                  : 'text-[#8b8f98] hover:text-white'
              }`}
            >
              Cobro Mensual
            </button>
            <button
              type="button"
              onClick={() => setTipoPago('diario')}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                tipoPago === 'diario'
                  ? 'bg-[#22242b] text-white shadow-xs border border-white/10'
                  : 'text-[#8b8f98] hover:text-white'
              }`}
            >
              Cobro Diario
            </button>
          </div>

          {/* Capital Input + Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-[#d4d4d4]">
                Monto del Capital ({symbol})
              </label>
              <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white">
                {symbol} {parseFloat(capital || 0).toLocaleString()}
              </span>
            </div>

            <input
              type="number"
              step="100"
              min="100"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-[#262626] border border-zinc-200 dark:border-[#383838] rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white font-mono text-sm outline-none focus:border-zinc-400"
            />

            <div className="flex flex-wrap gap-1.5">
              {[+500, +1000, +5000, +10000, +25000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => addCapital(amt)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#262626] dark:hover:bg-[#333] border border-zinc-200 dark:border-[#383838] text-[11px] font-mono text-zinc-700 dark:text-[#ccc]"
                >
                  +{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Tasa y Plazo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-[#d4d4d4]">
                  Tasa Mensual (%)
                </label>
                <span className="font-mono font-bold text-zinc-800 dark:text-white">{interes}%</span>
              </div>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={interes}
                onChange={(e) => setInteres(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-[#262626] border border-zinc-200 dark:border-[#383838] rounded-xl px-3 py-2 text-zinc-900 dark:text-white font-mono text-xs outline-none focus:border-zinc-400"
              />
              <div className="flex gap-1">
                {[3, 5, 6, 10, 15].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setInteres(t)}
                    className={`flex-1 py-1 rounded-md text-[10px] font-mono ${
                      interes === t 
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold' 
                        : 'bg-zinc-100 dark:bg-[#262626] text-zinc-600 dark:text-[#8e8e8e]'
                    }`}
                  >
                    {t}%
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-[#d4d4d4]">
                  Plazo ({tipoPago === 'diario' ? 'Meses (x30d)' : 'Meses'})
                </label>
                <span className="font-mono font-bold text-zinc-800 dark:text-white">{plazo}m</span>
              </div>
              <input
                type="number"
                min="1"
                max="60"
                value={plazo}
                onChange={(e) => setPlazo(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-[#262626] border border-zinc-200 dark:border-[#383838] rounded-xl px-3 py-2 text-zinc-900 dark:text-white font-mono text-xs outline-none focus:border-zinc-400"
              />
              <div className="flex gap-1">
                {[1, 2, 3, 6, 12].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlazo(p)}
                    className={`flex-1 py-1 rounded-md text-[10px] font-mono ${
                      plazo === p 
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold' 
                        : 'bg-zinc-100 dark:bg-[#262626] text-zinc-600 dark:text-[#8e8e8e]'
                    }`}
                  >
                    {p}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tarjetas de Resultados */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#262626] border border-zinc-200 dark:border-[#383838] space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-[#737373] block">
              Proyección de Retorno
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-white dark:bg-[#1f1f1f] border border-zinc-200 dark:border-[#333]">
                <span className="text-[10px] text-zinc-500 dark:text-[#8e8e8e] block">
                  Cuota Regular {tipoPago === 'diario' ? 'Diaria' : 'Mensual'}
                </span>
                <span className="text-base font-mono font-bold text-zinc-900 dark:text-white block mt-0.5">
                  {symbol} {simulacion.cuotaPeriodica.toLocaleString()}
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-[#737373] font-mono">
                  {simulacion.frecuenciaLabel}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-[#1f1f1f] border border-zinc-200 dark:border-[#333]">
                <span className="text-[10px] text-zinc-500 dark:text-[#8e8e8e] block">Ganancia Neta (Interés)</span>
                <span className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  +{symbol} {simulacion.interesTotal.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-mono">
                  +{simulacion.gananciaPorcentual}% sobre capital
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-zinc-200 dark:border-[#333] text-xs">
              <span className="text-zinc-600 dark:text-[#a3a3a3]">Total a Recuperar (Capital + Interés):</span>
              <strong className="text-zinc-900 dark:text-white font-mono text-sm">
                {symbol} {simulacion.totalRetorno.toLocaleString()}
              </strong>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 px-5 border-t border-zinc-200 dark:border-[#2e2e2e] flex items-center justify-between gap-2.5 bg-zinc-50 dark:bg-[#181818]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-[#a3a3a3] hover:bg-zinc-200/60 dark:hover:bg-[#262626] transition-all"
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Crear Préstamo con estos datos</span>
          </button>
        </div>

      </div>
    </div>
  );
}
