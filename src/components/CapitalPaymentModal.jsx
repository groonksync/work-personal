import React, { useState } from 'react';
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
  if (!isOpen || !loan) return null;

  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';

  const capitalOriginal = parseFloat(loan.capital) || 0;
  const abonosPrevios = Array.isArray(loan.abonos_capital) ? loan.abonos_capital : [];
  const totalAbonadoPrevio = abonosPrevios.reduce((acc, a) => acc + (parseFloat(a.monto) || 0), 0);
  const saldoActual = Math.max(0, capitalOriginal - totalAbonadoPrevio);

  const [montoAbono, setMontoAbono] = useState('');
  const [metodoRecalculo, setMetodoRecalculo] = useState(loan.metodo_recalculo || 'reducir_cuota');
  const [fechaAbono, setFechaAbono] = useState(new Date().toISOString().slice(0, 10));
  const [notasAbono, setNotasAbono] = useState('');

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

  const handleConfirm = () => {
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

    onConfirmCapitalPayment(loan.id, nuevoAbono);
    if (onShowToast) onShowToast(`Abono a capital de ${symbol} ${abonoNum} registrado`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-[#151619] border border-[#222327] rounded-2xl shadow-2xl flex flex-col text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-4 px-5 border-b border-[#222327] flex items-center justify-between bg-[#111215]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb]/10 border border-[#2563eb]/20 flex items-center justify-center text-[#3b82f6]">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight leading-none">
                Abono Extraordinario a Capital
              </h3>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Expediente: <strong className="text-white">{loan.nombre}</strong>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1b1c20] hover:bg-[#202126] text-zinc-400 hover:text-white flex items-center justify-center transition-colors border border-[#222327]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh] bg-[#151619]">
          
          {/* Tarjetas de Estado de Capital */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-[#1b1c20] border border-[#222327]">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
                Saldo Insoluto Actual
              </span>
              <div className="text-lg font-mono font-bold text-white mt-1">
                {symbol} {saldoActual.toLocaleString()}
              </div>
              <span className="text-[10px] text-zinc-500 block mt-0.5">
                Capital inicial: {symbol} {capitalOriginal.toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#1b1c20] border border-[#222327]">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
                Nuevo Saldo Tras Abono
              </span>
              <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                {symbol} {nuevoSaldoCapital.toLocaleString()}
              </div>
              <span className="text-[10px] text-zinc-500 block mt-0.5">
                Amortización: -{symbol} {abonoNum.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Formulario del Abono */}
          <div className="space-y-3 p-3.5 rounded-xl bg-[#1b1c20] border border-[#222327]">
            <div>
              <label className="text-[11px] font-semibold text-white block mb-1">
                Monto que Desea Abonar a Capital
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={montoAbono}
                  onChange={(e) => setMontoAbono(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#111215] border border-[#222327] focus:border-[#2563eb] p-2.5 pl-8 rounded-xl text-white font-mono text-base font-bold outline-none"
                  autoFocus
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-zinc-400">
                  {symbol}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-semibold block mb-1">
                  Fecha del Abono
                </label>
                <input
                  type="date"
                  value={fechaAbono}
                  onChange={(e) => setFechaAbono(e.target.value)}
                  className="w-full bg-[#111215] border border-[#222327] focus:border-[#2563eb] p-2 rounded-xl text-white font-mono outline-none text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-semibold block mb-1">
                  Comprobante / Detalle
                </label>
                <input
                  type="text"
                  value={notasAbono}
                  onChange={(e) => setNotasAbono(e.target.value)}
                  placeholder="Ej: Depósito Banco BCP"
                  className="w-full bg-[#111215] border border-[#222327] focus:border-[#2563eb] p-2 rounded-xl text-white outline-none text-xs"
                />
              </div>
            </div>

            {/* Selector de Recálculo */}
            <div className="pt-2 border-t border-[#222327] space-y-1.5">
              <span className="text-[11px] font-semibold text-white block">
                Método de Recálculo Financiero
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMetodoRecalculo('reducir_cuota')}
                  className={`p-2.5 rounded-xl border text-left transition-colors ${
                    metodoRecalculo === 'reducir_cuota'
                      ? 'bg-[#2563eb] text-white border-[#2563eb] font-medium shadow-xs'
                      : 'bg-[#111215] border-[#222327] text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="block font-semibold text-xs text-white">Reducir Cuota Mensual</span>
                  <span className={`text-[10px] block mt-0.5 ${metodoRecalculo === 'reducir_cuota' ? 'text-blue-100' : 'text-zinc-500'}`}>
                    Mantiene el plazo restante, pero baja la cuota.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoRecalculo('reducir_plazo')}
                  className={`p-2.5 rounded-xl border text-left transition-colors ${
                    metodoRecalculo === 'reducir_plazo'
                      ? 'bg-[#2563eb] text-white border-[#2563eb] font-medium shadow-xs'
                      : 'bg-[#111215] border-[#222327] text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="block font-semibold text-xs text-white">Reducir Plazo</span>
                  <span className={`text-[10px] block mt-0.5 ${metodoRecalculo === 'reducir_plazo' ? 'text-blue-100' : 'text-zinc-500'}`}>
                    Mantiene el monto de cuota, termina antes.
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Simulación en Vivo */}
          {abonoNum > 0 && (
            <div className="p-3.5 rounded-xl bg-[#1b1c20] border border-[#222327] space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <Calculator className="w-3.5 h-3.5" />
                <span>Simulación de Impacto Financiero</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2 rounded-xl bg-[#111215] border border-[#222327]">
                  <span className="text-[10px] text-zinc-400 block">Cuota Anterior</span>
                  <strong className="text-white font-mono text-xs block mt-0.5">
                    {symbol} {cuotaTotalAntigua.toLocaleString()}
                  </strong>
                </div>

                <div className="p-2 rounded-xl bg-[#111215] border border-[#222327]">
                  <span className="text-[10px] text-emerald-400 block font-semibold">Nueva Cuota</span>
                  <strong className="text-emerald-400 font-mono text-xs block mt-0.5">
                    {symbol} {cuotaTotalNueva.toLocaleString()}
                  </strong>
                </div>

                <div className="p-2 rounded-xl bg-[#111215] border border-[#222327]">
                  <span className="text-[10px] text-zinc-400 block">Ahorro Mensual</span>
                  <strong className="text-white font-mono text-xs block mt-0.5">
                    -{symbol} {ahorroMensual.toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 px-5 border-t border-[#222327] bg-[#111215] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-[#1b1c20] hover:bg-[#202126] text-xs font-medium text-zinc-300 border border-[#222327] transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            disabled={abonoNum <= 0}
            className="px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Confirmar Abono a Capital</span>
          </button>
        </div>

      </div>
    </div>
  );
}
