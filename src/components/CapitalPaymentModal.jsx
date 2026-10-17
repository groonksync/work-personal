import React, { useEffect, useState } from 'react';
import { 
  X, DollarSign, TrendingDown, Calendar, Check, 
  ArrowRight, Calculator, AlertCircle, FileCheck
} from 'lucide-react';

export default function CapitalPaymentModal({
  isOpen,
  onClose,
  loan,
  currency = 'BOB',
  onConfirmCapitalPayment,
  onShowToast,
}) {
  const [montoAbono, setMontoAbono] = useState('');
  const [metodoRecalculo, setMetodoRecalculo] = useState('reducir_cuota');
  const [fechaAbono, setFechaAbono] = useState('');
  const [notasAbono, setNotasAbono] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !loan) return;
    const now = new Date();
    setMontoAbono('');
    setMetodoRecalculo(loan.metodo_recalculo || 'reducir_cuota');
    setFechaAbono(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
    setNotasAbono('');
    setSaving(false);
  }, [isOpen, loan?.id]);

  if (!isOpen || !loan) return null;

  const loanCurrency = loan.moneda || currency;
  const symbol = loanCurrency === 'BOB' ? 'Bs.' : loanCurrency === 'PEN' ? 'S/' : '$';

  const capitalOriginal = parseFloat(loan.capital) || 0;
  const abonosPrevios = Array.isArray(loan.abonos_capital) ? loan.abonos_capital : [];
  const totalAbonadoPrevio = abonosPrevios.reduce((acc, a) => acc + (parseFloat(a.monto) || 0), 0);
  const saldoActual = Math.max(0, capitalOriginal - totalAbonadoPrevio);

  const abonoNum = parseFloat(montoAbono) || 0;
  const nuevoSaldoCapital = Math.max(0, saldoActual - abonoNum);

  // Simulación de cuota
  const tasa = parseFloat(loan.interes) || 0;
  const plazoMeses = parseInt(loan.plazo_meses) || 6;
  const cuotaCapitalAntigua = Math.round(saldoActual / plazoMeses);
  const interesMensualAntiguo = Math.round(saldoActual * (tasa / 100));
  const cuotaTotalAntigua = cuotaCapitalAntigua + interesMensualAntiguo;

  const cuotaCapitalNueva = Math.round(nuevoSaldoCapital / plazoMeses);
  const interesMensualNuevo = Math.round(nuevoSaldoCapital * (tasa / 100));
  const cuotaTotalNueva = cuotaCapitalNueva + interesMensualNuevo;
  const ahorroMensual = Math.max(0, cuotaTotalAntigua - cuotaTotalNueva);

  const handleConfirm = async () => {
    if (saving) return;
    if (abonoNum <= 0) {
      alert('Ingresa un monto válido para el abono a capital.');
      return;
    }
    if (abonoNum > saldoActual) {
      alert(`El abono no puede superar el saldo actual de ${symbol} ${saldoActual.toLocaleString()}.`);
      return;
    }

    const nuevoAbono = {
      id: `abono-cap-${Date.now()}`,
      fecha: fechaAbono,
      monto: abonoNum,
      metodo: metodoRecalculo,
      notas: notasAbono.trim() || 'Abono directo a capital',
    };

    setSaving(true);
    const saved = await onConfirmCapitalPayment(loan.id, nuevoAbono);
    setSaving(false);
    if (saved) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-[#2e2e2e] rounded-2xl shadow-2xl flex flex-col text-zinc-900 dark:text-[#ececec] overflow-hidden transition-colors duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-4 px-5 border-b border-zinc-200 dark:border-[#2e2e2e] flex items-center justify-between bg-zinc-50 dark:bg-[#171717] transition-colors duration-150">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-[#262626] border border-emerald-200 dark:border-[#383838] flex items-center justify-center text-zinc-800 dark:text-white">
              <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight leading-none">
                Abono Extraordinario a Capital
              </h3>
              <span className="text-[11px] text-zinc-500 dark:text-[#8e8e8e] mt-1 block">
                Expediente: <strong className="text-zinc-900 dark:text-white">{loan.nombre}</strong>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={saving}
            className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#262626] dark:hover:bg-[#333333] text-zinc-500 hover:text-zinc-900 dark:text-[#a3a3a3] dark:hover:text-white flex items-center justify-center transition-all border border-zinc-200 dark:border-transparent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh] bg-[#f7f7f8] dark:bg-[#1e1e1e]">
          
          {/* Tarjetas de Estado de Capital */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-white dark:bg-[#262626] border border-zinc-200 dark:border-[#333333] shadow-xs">
              <span className="text-[10px] text-zinc-500 dark:text-[#8e8e8e] uppercase font-semibold block">
                Saldo Insoluto Actual
              </span>
              <div className="text-lg font-mono font-bold text-zinc-900 dark:text-white mt-1">
                {symbol} {saldoActual.toLocaleString()}
              </div>
              <span className="text-[10px] text-zinc-400 dark:text-[#737373] block mt-0.5">
                Capital inicial: {symbol} {capitalOriginal.toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-[#262626] border border-zinc-200 dark:border-[#333333] shadow-xs">
              <span className="text-[10px] text-zinc-500 dark:text-[#8e8e8e] uppercase font-semibold block">
                Nuevo Saldo Tras Abono
              </span>
              <div className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {symbol} {nuevoSaldoCapital.toLocaleString()}
              </div>
              <span className="text-[10px] text-zinc-400 dark:text-[#737373] block mt-0.5">
                Amortización: -{symbol} {abonoNum.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Formulario del Abono */}
          <div className="space-y-3 p-3.5 rounded-xl bg-white dark:bg-[#262626] border border-zinc-200 dark:border-[#333333] shadow-xs">
            <div>
              <label className="text-[11px] font-semibold text-zinc-900 dark:text-white block mb-1">
                Monto que Desea Abonar a Capital
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={montoAbono}
                  onChange={(e) => setMontoAbono(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-zinc-50 dark:bg-[#1c1c1c] border border-zinc-200 dark:border-[#383838] focus:border-emerald-500 p-2.5 pl-8 rounded-lg text-zinc-900 dark:text-white font-mono text-base font-bold outline-none"
                  autoFocus
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-zinc-400 dark:text-[#737373]">
                  {symbol}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-500 dark:text-[#8e8e8e] uppercase font-semibold block mb-1">
                  Fecha del Abono
                </label>
                <input
                  type="date"
                  value={fechaAbono}
                  onChange={(e) => setFechaAbono(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-[#1c1c1c] border border-zinc-200 dark:border-[#383838] p-2 rounded-lg text-zinc-900 dark:text-white font-mono outline-none text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 dark:text-[#8e8e8e] uppercase font-semibold block mb-1">
                  Comprobante / Detalle
                </label>
                <input
                  type="text"
                  value={notasAbono}
                  onChange={(e) => setNotasAbono(e.target.value)}
                  placeholder="Ej: Depósito Banco BCP"
                  className="w-full bg-zinc-50 dark:bg-[#1c1c1c] border border-zinc-200 dark:border-[#383838] p-2 rounded-lg text-zinc-900 dark:text-white outline-none text-xs"
                />
              </div>
            </div>

            {/* Selector de Recálculo */}
            <div className="pt-2 border-t border-zinc-100 dark:border-[#333333] space-y-1.5">
              <span className="text-[11px] font-semibold text-zinc-900 dark:text-white block">
                Método de Recálculo Financiero
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMetodoRecalculo('reducir_cuota')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    metodoRecalculo === 'reducir_cuota'
                      ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-[#333333] dark:border-white font-medium shadow-xs'
                      : 'bg-zinc-50 dark:bg-[#1c1c1c] border-zinc-200 dark:border-[#383838] text-zinc-600 dark:text-[#8e8e8e]'
                  }`}
                >
                  <span className={`block font-semibold text-xs ${metodoRecalculo === 'reducir_cuota' ? 'text-white' : 'text-zinc-800 dark:text-white'}`}>Reducir Cuota Mensual</span>
                  <span className={`text-[10px] block mt-0.5 ${metodoRecalculo === 'reducir_cuota' ? 'text-zinc-300 dark:text-[#a3a3a3]' : 'text-zinc-500 dark:text-[#a3a3a3]'}`}>
                    Mantiene el plazo restante, pero baja la cuota.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoRecalculo('reducir_plazo')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    metodoRecalculo === 'reducir_plazo'
                      ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-[#333333] dark:border-white font-medium shadow-xs'
                      : 'bg-zinc-50 dark:bg-[#1c1c1c] border-zinc-200 dark:border-[#383838] text-zinc-600 dark:text-[#8e8e8e]'
                  }`}
                >
                  <span className={`block font-semibold text-xs ${metodoRecalculo === 'reducir_plazo' ? 'text-white' : 'text-zinc-800 dark:text-white'}`}>Reducir Plazo</span>
                  <span className={`text-[10px] block mt-0.5 ${metodoRecalculo === 'reducir_plazo' ? 'text-zinc-300 dark:text-[#a3a3a3]' : 'text-zinc-500 dark:text-[#a3a3a3]'}`}>
                    Mantiene el monto de cuota, termina antes.
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Simulación en Vivo */}
          {abonoNum > 0 && (
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#262626] border border-emerald-500/30 space-y-2 animate-in fade-in duration-150 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                <Calculator className="w-3.5 h-3.5" />
                <span>Simulación de Impacto Financiero</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2 rounded-lg bg-zinc-50 dark:bg-[#1c1c1c] border border-zinc-200 dark:border-[#333]">
                  <span className="text-[10px] text-zinc-500 dark:text-[#8e8e8e] block">Cuota Anterior</span>
                  <strong className="text-zinc-900 dark:text-white font-mono text-xs block mt-0.5">
                    {symbol} {cuotaTotalAntigua.toLocaleString()}
                  </strong>
                </div>

                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-[#1c1c1c] border border-emerald-300 dark:border-emerald-500/30">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">Nueva Cuota</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-xs block mt-0.5">
                    {symbol} {cuotaTotalNueva.toLocaleString()}
                  </strong>
                </div>

                <div className="p-2 rounded-lg bg-zinc-50 dark:bg-[#1c1c1c] border border-zinc-200 dark:border-[#333]">
                  <span className="text-[10px] text-zinc-500 dark:text-[#8e8e8e] block">Ahorro Mensual</span>
                  <strong className="text-zinc-900 dark:text-white font-mono text-xs block mt-0.5">
                    -{symbol} {ahorroMensual.toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 px-5 border-t border-zinc-200 dark:border-[#2e2e2e] bg-zinc-50 dark:bg-[#171717] flex items-center justify-between transition-colors duration-150">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg bg-white dark:bg-[#262626] hover:bg-zinc-100 dark:hover:bg-[#303030] text-xs font-medium text-zinc-700 dark:text-[#d4d4d4] border border-zinc-200 dark:border-transparent transition-all shadow-2xs"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            disabled={abonoNum <= 0 || saving}
            className="px-4 py-2 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{saving ? 'Guardando…' : 'Confirmar Abono a Capital'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
