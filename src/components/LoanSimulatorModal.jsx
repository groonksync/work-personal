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
        className="w-full max-w-lg bg-[#151619] border border-[#222327] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-4 px-5 border-b border-[#222327] flex items-center justify-between bg-[#111215]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1b1c20] border border-[#26282e] text-[#3b82f6] flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight leading-none">
                Simulador &amp; Calculadora Financiera
              </h3>
              <p className="text-[11px] text-[#8b8f98] mt-1">
                Proyecta cuotas, rendimientos y ganancias netas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[#1b1c20] hover:bg-[#222329] border border-[#26282e] text-zinc-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scroll text-xs">
          
          {/* Selector de Modalidad */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#111215] border border-[#222327] rounded-xl">
            <button
              type="button"
              onClick={() => setTipoPago('mensual')}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                tipoPago === 'mensual'
                  ? 'bg-[#2563eb] text-white shadow-xs'
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
                  ? 'bg-[#2563eb] text-white shadow-xs'
                  : 'text-[#8b8f98] hover:text-white'
              }`}
            >
              Cobro Diario
            </button>
          </div>

          {/* Capital Input + Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-zinc-400">
                Monto del Capital ({symbol})
              </label>
              <span className="font-mono text-xs font-bold text-white">
                {symbol} {parseFloat(capital || 0).toLocaleString()}
              </span>
            </div>

            <input
              type="number"
              step="100"
              min="100"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              className="w-full bg-[#1b1c20] border border-[#26282e] rounded-xl px-3.5 py-2.5 text-white font-mono text-sm outline-none focus:border-[#2563eb] transition-colors"
            />

            <div className="flex flex-wrap gap-1.5">
              {[+500, +1000, +5000, +10000, +25000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => addCapital(amt)}
                  className="px-2.5 py-1 rounded-lg bg-[#1b1c20] hover:bg-[#2563eb] hover:text-white border border-[#26282e] text-[11px] font-mono text-zinc-300 transition-colors"
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
                <label className="text-[11px] font-semibold text-zinc-400">
                  Tasa Mensual (%)
                </label>
                <span className="font-mono font-bold text-white">{interes}%</span>
              </div>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={interes}
                onChange={(e) => setInteres(e.target.value)}
                className="w-full bg-[#1b1c20] border border-[#26282e] rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-[#2563eb] transition-colors"
              />
              <div className="flex gap-1">
                {[3, 5, 6, 10, 15].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setInteres(t)}
                    className={`flex-1 py-1 rounded-md text-[10px] font-mono transition-colors ${
                      interes === t 
                        ? 'bg-[#2563eb] text-white font-bold' 
                        : 'bg-[#1b1c20] hover:bg-[#22242b] border border-[#26282e] text-zinc-400'
                    }`}
                  >
                    {t}%
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-zinc-400">
                  Plazo ({tipoPago === 'diario' ? 'Meses (x30d)' : 'Meses'})
                </label>
                <span className="font-mono font-bold text-white">{plazo}m</span>
              </div>
              <input
                type="number"
                min="1"
                max="60"
                value={plazo}
                onChange={(e) => setPlazo(e.target.value)}
                className="w-full bg-[#1b1c20] border border-[#26282e] rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-[#2563eb] transition-colors"
              />
              <div className="flex gap-1">
                {[1, 2, 3, 6, 12].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlazo(p)}
                    className={`flex-1 py-1 rounded-md text-[10px] font-mono transition-colors ${
                      plazo === p 
                        ? 'bg-[#2563eb] text-white font-bold' 
                        : 'bg-[#1b1c20] hover:bg-[#22242b] border border-[#26282e] text-zinc-400'
                    }`}
                  >
                    {p}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tarjetas de Resultados */}
          <div className="p-4 rounded-xl bg-[#111215] border border-[#222327] space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
              Proyección de Retorno
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#1b1c20] border border-[#26282e]">
                <span className="text-[10px] text-[#8b8f98] block">
                  Cuota Regular {tipoPago === 'diario' ? 'Diaria' : 'Mensual'}
                </span>
                <span className="text-base font-mono font-bold text-white block mt-0.5">
                  {symbol} {simulacion.cuotaPeriodica.toLocaleString()}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {simulacion.frecuenciaLabel}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#1b1c20] border border-[#26282e]">
                <span className="text-[10px] text-[#8b8f98] block">Ganancia Neta (Interés)</span>
                <span className="text-base font-mono font-bold text-emerald-400 block mt-0.5">
                  +{symbol} {simulacion.interesTotal.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-400/80 font-mono">
                  +{simulacion.gananciaPorcentual}% sobre capital
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#222327] text-xs">
              <span className="text-zinc-400">Total a Recuperar (Capital + Interés):</span>
              <strong className="text-white font-mono text-sm">
                {symbol} {simulacion.totalRetorno.toLocaleString()}
              </strong>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 px-5 border-t border-[#222327] flex items-center justify-between gap-2.5 bg-[#111215]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-[#1b1c20] transition-all"
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Crear Préstamo con estos datos</span>
          </button>
        </div>

      </div>
    </div>
  );
}
