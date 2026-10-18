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
  const symbol = currency === 'BOB' ? 'Bs. ' : currency === 'PEN' ? 'S/ ' : '$ ';
  const totalPagado = Math.max(0, folder.totalCapital - folder.totalAdeudado);
  const driveUrl = folder.driveUrl || defaultDriveUrl;

  return (
    <div className="space-y-6 text-[#f3f4f6]">
      {/* Botón de regreso */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="h-9 px-3.5 rounded-xl bg-[#141518] hover:bg-[#1a1b20] text-white border border-[#24252a] text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a todos los expedientes</span>
        </button>
        <span className="text-xs text-[#8b8f98] font-mono">
          {folder.contratos.length} contrato(s) activos
        </span>
      </div>

      {/* Encabezado del Expediente */}
      <div className="p-6 space-y-4 bg-[#141518] border border-[#24252a] rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#1b1c21] border border-[#2b2d35] flex items-center justify-center text-white font-bold text-lg">
              {folder.nombre?.charAt(0) || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">{folder.nombre}</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-lg bg-[#1b1c21] border border-white/5 text-[#8b8f98] font-medium">
                  {folder.tipo_prestamo === 'recibido' ? 'Prestamista' : 'Deudor'}
                </span>
              </div>
              <p className="text-xs text-[#8b8f98] mt-0.5 font-mono">
                {folder.telefono ? `Teléfono: ${folder.telefono}` : 'Sin teléfono'}
                {folder.ci ? ` • CI: ${folder.ci}` : ''}
              </p>
            </div>
          </div>

          {/* Botones de acción generales */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-3 rounded-xl bg-[#1b1c21] hover:bg-[#22242b] text-zinc-300 hover:text-white border border-white/5 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Abrir carpeta en Google Drive"
            >
              <HardDrive className="w-4 h-4" />
              <span>Drive</span>
            </a>

            <button
              onClick={() => onSendWhatsApp(folder)}
              className="h-9 px-3.5 rounded-xl bg-[#1b1c21] hover:bg-[#22242b] text-zinc-300 hover:text-white border border-white/5 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Resumen Numérico */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#202126]">
          <div className="p-3 rounded-xl bg-[#0d0e11] border border-[#202126]">
            <span className="text-[10px] uppercase font-semibold text-[#6e737e] block">Total Capital</span>
            <span className="text-base font-mono font-bold text-white">
              {symbol}{folder.totalCapital.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#0d0e11] border border-[#202126]">
            <span className="text-[10px] uppercase font-semibold text-[#6e737e] block">Monto ya Pagado</span>
            <span className="text-base font-mono font-bold text-white">
              {symbol}{totalPagado.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#0d0e11] border border-[#202126]">
            <span className="text-[10px] uppercase font-semibold text-[#6e737e] block">Saldo Pendiente</span>
            <span className="text-base font-mono font-bold text-white">
              {symbol}{folder.totalAdeudado.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#0d0e11] border border-[#202126]">
            <span className="text-[10px] uppercase font-semibold text-[#6e737e] block">Próxima Cuota</span>
            <span className="text-base font-mono font-bold text-white">
              {symbol}{folder.cuotaProxima.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Listado de Contratos y sus Cuotas */}
      {folder.contratos.map((contrato, cIdx) => {
        const cuotas = generarCronograma(contrato);
        const cuotasPagadas = cuotas.filter(c => c.pagado).length;

        return (
          <div key={contrato.id || cIdx} className="p-6 rounded-2xl bg-[#1a1b1e] border border-[#26282e] space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#24252a]">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Contrato #{contrato.id?.slice(0, 6) || cIdx + 1} — {symbol}{parseFloat(contrato.capital || 0).toLocaleString()}
                </h3>
                <span className="text-xs text-[#8b8f98]">
                  Interés: {contrato.interes}% • Plazo: {contrato.plazo_meses || 6} meses • Inicio: {contrato.inicio}
                </span>
              </div>

              {/* Acciones del Contrato */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenCapitalPayment && onOpenCapitalPayment(contrato)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#222328] hover:bg-[#2b2d33] text-emerald-400 text-xs font-semibold border border-white/5 flex items-center gap-1.5 transition-all"
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Abono Capital</span>
                </button>

                <button
                  onClick={() => onOpenVouchers && onOpenVouchers(contrato)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#222328] hover:bg-[#2b2d33] text-white text-xs font-semibold border border-white/5 flex items-center gap-1.5 transition-all"
                >
                  <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bauchers QR</span>
                </button>

                <button
                  onClick={() => onOpenExpressNotes && onOpenExpressNotes(contrato)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#222328] hover:bg-[#2b2d33] text-white text-xs font-semibold border border-white/5 flex items-center gap-1.5 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Notas</span>
                </button>

                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#141517] border border-[#202126] text-zinc-300">
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
                      ? 'bg-[#141517] border-[#1e1f24] text-zinc-500 opacity-75'
                      : cuota.estado === 'hoy'
                      ? 'border-amber-500/50 bg-[#241f17] ring-1 ring-amber-500/30 text-white'
                      : cuota.estado === 'vencido'
                      ? 'border-rose-500/40 bg-[#251818] text-white'
                      : 'bg-[#16171a] border-[#22242a] text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-mono font-bold text-zinc-500">
                      #{cuota.numero}
                    </span>
                    <div>
                      <span className={`font-semibold block ${cuota.pagado ? 'line-through text-zinc-500' : 'text-white'}`}>
                        {cuota.label} — Vence: {cuota.fechaVencimiento}
                      </span>
                      <span className="text-[11px] text-[#8b8f98]">
                        Capital: {symbol}{cuota.capital} + Interés: {symbol}{cuota.interes}
                        {cuota.mora > 0 && ` • Mora: +${symbol}${cuota.mora}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">
                      {symbol}{cuota.total + (cuota.mora || 0)}
                    </span>

                    {cuota.pagado ? (
                      <span className="px-2.5 py-1 rounded-lg border border-emerald-500/20 text-emerald-400 font-mono font-medium flex items-center gap-1 bg-emerald-500/10">
                        <Check className="w-3 h-3" />
                        <span>PAGADO</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onPayCuota(contrato, cuota)}
                          className="h-8 px-3 rounded-lg bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-all active:scale-95 shadow-xs"
                        >
                          Abonar
                        </button>
                        <button
                          onClick={() => onOpenReceipt(folder, contrato, cuota)}
                          className="h-8 px-2.5 rounded-lg bg-[#222328] hover:bg-[#2b2d33] text-zinc-300 hover:text-white border border-white/5 transition-all"
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
