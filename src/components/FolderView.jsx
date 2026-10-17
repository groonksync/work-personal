import React from 'react';
import { 
  ArrowLeft, Check, FileText, MessageCircle, DollarSign, Calendar, 
  Clock, Folder, Receipt, MessageSquare, TrendingDown, HardDrive 
} from 'lucide-react';
import { generarCronograma } from '../lib/amortizacion';

export default function FolderView({
  folder,
  currency,
  onBack,
  onPayCuota,
  onOpenReceipt,
  onSendWhatsApp,
  onOpenVouchers,
  onOpenExpressNotes,
  onOpenCapitalPayment,
  defaultDriveUrl = 'https://drive.google.com',
}) {
  const symbols = { BOB: 'Bs.', USD: '$', PEN: 'S/' };
  const summaries = {};
  folder.contratos.forEach((loan) => {
    const code = loan.moneda || currency;
    const schedule = generarCronograma(loan);
    summaries[code] ||= { capital: 0, paidCapital: 0, balance: 0 };
    summaries[code].capital += Number(loan.capital) || 0;
    summaries[code].paidCapital += schedule.filter((item) => item.pagado).reduce((sum, item) => sum + item.capital, 0);
    summaries[code].balance += schedule.filter((item) => !item.pagado).reduce((sum, item) => sum + item.total, 0);
  });
  const format = (value) => new Intl.NumberFormat('es-BO', { maximumFractionDigits: 2 }).format(value || 0);

  return (
    <div className="space-y-6">
      {/* Botón de regreso */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="btn-base h-9 card-base bg-white dark:bg-[#262626] text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-[#303030] border border-zinc-200 dark:border-[#333]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a todas las personas</span>
        </button>
        <span className="text-xs text-zinc-500 dark:text-[#8e8e8e] font-mono">
          {folder.contratos.length} contrato(s) activos
        </span>
      </div>

      {/* Encabezado del Expediente */}
      <div className="card-base p-6 space-y-4 bg-white dark:bg-[#262626] border border-zinc-200 dark:border-[#333333] rounded-2xl shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-[#1e1e1e] border border-zinc-200 dark:border-[#383838] flex items-center justify-center text-zinc-800 dark:text-white">
              <Folder className="w-6 h-6 text-amber-500 dark:text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">{folder.nombre}</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-[#1e1e1e] border border-zinc-200 dark:border-[#383838] text-zinc-600 dark:text-[#a3a3a3]">
                  {folder.tipo_prestamo === 'recibido' ? 'Prestamista' : 'Deudor'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-[#8e8e8e] mt-0.5">
                {folder.telefono ? `Teléfono: ${folder.telefono}` : 'Sin teléfono registrado'}
                {folder.ci ? ` • CI: ${folder.ci}` : ''}
              </p>
            </div>
          </div>

          {/* Botones de acción generales */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSendWhatsApp(folder)}
              className="btn-base h-9 px-3.5 rounded-lg bg-zinc-100 dark:bg-[#1e1e1e] hover:bg-zinc-200 dark:hover:bg-[#2d2d2d] text-emerald-600 dark:text-emerald-400 border border-zinc-200 dark:border-[#383838] text-xs flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-zinc-200 pt-3 dark:border-[#333333] sm:grid-cols-2 xl:grid-cols-3">
          {Object.entries(summaries).map(([code, summary]) => <div key={code} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-[#333333] dark:bg-[#1e1e1e]"><span className="text-[11px] font-semibold text-zinc-500 dark:text-[#8e8e8e]">{code} · {folder.contratos.filter((loan) => (loan.moneda || currency) === code).length} contrato(s)</span><div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-xs"><span className="text-zinc-500 dark:text-[#8e8e8e]">Capital inicial</span><strong className="text-right font-mono">{symbols[code] || code} {format(summary.capital)}</strong><span className="text-zinc-500 dark:text-[#8e8e8e]">Capital pagado</span><strong className="text-right font-mono text-emerald-700 dark:text-emerald-300">{symbols[code] || code} {format(summary.paidCapital)}</strong><span className="text-zinc-500 dark:text-[#8e8e8e]">Saldo programado</span><strong className="text-right font-mono">{symbols[code] || code} {format(summary.balance)}</strong></div></div>)}
        </div>
      </div>

      {/* Listado de Contratos y sus Cuotas */}
      {folder.contratos.map((contrato, cIdx) => {
        const cuotas = generarCronograma(contrato);
        const cuotasPagadas = cuotas.filter(c => c.pagado).length;
        const contractCurrency = contrato.moneda || currency;
        const symbol = `${symbols[contractCurrency] || contractCurrency} `;

        return (
          <div key={contrato.id || cIdx} className="p-6 rounded-2xl bg-white dark:bg-[#262626] border border-zinc-200 dark:border-[#333333] space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-[#333333]">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {contrato.titulo_prestamo || `Préstamo ${cIdx + 1}`} — {symbol}{format(Number(contrato.capital) || 0)}
                </h3>
                <span className="text-xs text-zinc-500 dark:text-[#8e8e8e]">
                  Contrato #{contrato.id?.slice(0, 8) || cIdx + 1} · Interés mensual: {contrato.interes}% · Plazo: {contrato.plazo_meses || 'Sin definir'} meses · Inicio: {contrato.inicio || 'Sin fecha'}
                </span>
              </div>

              {/* Acciones del Contrato */}
              <div className="flex items-center gap-2">
                {contrato.drive_contrato && <a href={contrato.drive_contrato} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-[#1e1e1e] hover:bg-zinc-200 dark:hover:bg-[#303030] text-sky-700 dark:text-sky-300 text-xs font-medium border border-zinc-200 dark:border-[#383838] flex items-center gap-1.5" title="Abrir documento de este contrato"><HardDrive className="w-3.5 h-3.5" />Drive</a>}
                <button
                  onClick={() => onOpenCapitalPayment && onOpenCapitalPayment(contrato)}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-[#1e1e1e] hover:bg-zinc-200 dark:hover:bg-[#303030] text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-zinc-200 dark:border-[#383838] flex items-center gap-1.5 transition-all"
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Abono Capital</span>
                </button>

                <button
                  onClick={() => onOpenVouchers && onOpenVouchers(contrato)}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-[#1e1e1e] hover:bg-zinc-200 dark:hover:bg-[#303030] text-zinc-800 dark:text-white text-xs font-medium border border-zinc-200 dark:border-[#383838] flex items-center gap-1.5 transition-all"
                >
                  <Receipt className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Bauchers QR</span>
                </button>

                <button
                  onClick={() => onOpenExpressNotes && onOpenExpressNotes(contrato)}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-[#1e1e1e] hover:bg-zinc-200 dark:hover:bg-[#303030] text-zinc-800 dark:text-white text-xs font-medium border border-zinc-200 dark:border-[#383838] flex items-center gap-1.5 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span>Notas</span>
                </button>

                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-[#1e1e1e] border border-zinc-200 dark:border-[#383838] text-zinc-800 dark:text-white">
                  {cuotasPagadas} / {cuotas.length}
                </span>
              </div>
            </div>

            {/* Cronograma de Cuotas */}
            <div className="space-y-2">
              {cuotas.map((cuota) => (
                <div
                  key={cuota.key}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                    cuota.pagado
                      ? 'bg-zinc-100 dark:bg-[#202020] border-zinc-200 dark:border-[#2d2d2d] text-zinc-400 dark:text-[#737373]'
                      : cuota.estado === 'hoy'
                      ? 'border-amber-500/50 bg-amber-50 dark:bg-[#292929] ring-1 ring-amber-500/30'
                      : cuota.estado === 'vencido'
                      ? 'border-rose-400 bg-rose-50 dark:border-rose-500/40 dark:bg-[#292323]'
                      : 'bg-zinc-50 dark:bg-[#222222] border-zinc-200 dark:border-[#333333] text-zinc-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-mono font-bold text-zinc-400 dark:text-[#8e8e8e]">
                      #{cuota.numero}
                    </span>
                    <div>
                      <span className={`font-medium block ${cuota.pagado ? 'line-through text-zinc-400 dark:text-[#737373]' : 'text-zinc-900 dark:text-white'}`}>
                        {cuota.label} — Vence: {cuota.fechaVencimiento}
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-[#8e8e8e]">
                        Capital: {symbol}{format(cuota.capital)} + Interés: {symbol}{format(cuota.interes)}
                        {cuota.mora > 0 && ` • Mora: +${symbol}${cuota.mora}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                      {symbol}{format(cuota.total + (cuota.mora || 0))}
                    </span>

                    {cuota.pagado ? (
                      <span className="px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-[#383838] text-emerald-600 dark:text-emerald-400 font-mono font-medium flex items-center gap-1 bg-emerald-50 dark:bg-[#1e1e1e]">
                        <Check className="w-3 h-3" />
                        <span>PAGADO</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onPayCuota(contrato, cuota)}
                          className="h-8 px-3 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold text-xs transition-all active:scale-95 shadow-xs"
                        >
                          Abonar
                        </button>
                        <button
                          onClick={() => onOpenReceipt(folder, contrato, cuota)}
                          className="h-8 px-2.5 rounded-lg bg-zinc-100 dark:bg-[#1e1e1e] hover:bg-zinc-200 dark:hover:bg-[#303030] text-zinc-800 dark:text-white border border-zinc-200 dark:border-[#383838] transition-all"
                          title="Recibo"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
