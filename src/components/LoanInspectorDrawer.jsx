import React from 'react';
import { 
  X, Check, Send, Receipt, Phone, User, Calendar, 
  DollarSign, TrendingUp, TrendingDown, AlertCircle, Shield, FileText, 
  ExternalLink, ChevronRight, Zap, Landmark, MessageSquare, 
  HardDrive, PlusCircle
} from 'lucide-react';
import { generarCronograma } from '../lib/amortizacion';

export default function LoanInspectorDrawer({
  loan,
  onClose,
  currency = 'BOB',
  onPayCuota,
  onOpenReceipt,
  onSendWhatsApp,
  onOpenCapitalPayment,
  onOpenVouchers,
  onOpenExpressNotes,
  defaultDriveUrl = 'https://drive.google.com',
}) {
  if (!loan) return null;

  const currencyCode = loan.moneda || currency;
  const symbol = currencyCode === 'BOB' ? 'Bs.' : currencyCode === 'PEN' ? 'S/' : '$';
  const cronograma = generarCronograma(loan);
  const cuotasPagadas = cronograma.filter(c => c.pagado).length;
  const cuotaProxima = cronograma.find(c => !c.pagado) || cronograma[cronograma.length - 1];

  const capitalOriginal = parseFloat(loan.capital) || 0;
  const abonosCapital = Array.isArray(loan.abonos_capital) ? loan.abonos_capital : [];
  const totalAbonadoCapital = abonosCapital.reduce((acc, a) => acc + (parseFloat(a.monto) || 0), 0);
  const saldoCapitalActual = Math.max(0, capitalOriginal - totalAbonadoCapital);
  const porcentajeAmortizado = capitalOriginal > 0 
    ? Math.min(100, Math.round((totalAbonadoCapital / capitalOriginal) * 100))
    : 0;

  const notasExpressCount = Array.isArray(loan.notas_express) ? loan.notas_express.length : 0;
  const esAcreedor = loan.tipo_prestamo === 'recibido';
  const driveUrl = loan.drive_contrato || loan.drive_url || '';

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end bg-black/60 md:bg-transparent backdrop-blur-xs md:backdrop-blur-none animate-in fade-in duration-200">
      
      {/* Fondo clickeable para cerrar en móvil */}
      <div className="absolute inset-0 md:hidden" onClick={onClose}></div>

      {/* CONTENEDOR: BOTTOM SHEET EN MÓVIL / SIDE DRAWER EN DESKTOP */}
      <div className="relative w-full md:w-[460px] max-h-[92vh] md:max-h-full h-auto md:h-full bg-white dark:bg-[#1e1e1e] rounded-t-3xl md:rounded-none border-t md:border-t-0 md:border-l border-zinc-200 dark:border-[#2e2e2e] shadow-2xl flex flex-col text-zinc-900 dark:text-[#ececec] animate-in slide-in-from-bottom md:slide-in-from-right duration-200 pb-[env(safe-area-inset-bottom,16px)] md:pb-0 z-10 transition-colors duration-150">
        
        {/* Tirador para deslizar en móvil */}
        <div className="w-12 h-1 rounded-full bg-zinc-300 dark:bg-[#444444] mx-auto mt-2.5 md:hidden shrink-0"></div>

        {/* HEADER DEL INSPECTOR (ESTILO CHATGPT, SVG PLANO) */}
        <div className="p-4 border-b border-zinc-200 dark:border-[#2e2e2e] flex items-center justify-between bg-zinc-50 dark:bg-[#191919] shrink-0 transition-colors duration-150">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white dark:bg-[#262626] border border-zinc-200 dark:border-[#383838] flex items-center justify-center text-zinc-800 dark:text-white">
              {esAcreedor ? (
                <Landmark className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              ) : (
                <User className="w-4 h-4 text-zinc-600 dark:text-[#d4d4d4]" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight leading-none">
                {loan.nombre}
              </h3>
              <span className="text-xs text-zinc-500 dark:text-[#a3a3a3] font-medium block mt-1">
                {loan.titulo_prestamo || 'Préstamo'} · {esAcreedor ? 'Acreedor' : `CI: ${loan.ci || 'Sin registro'}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón directo a Google Drive */}
            {driveUrl ? <a href={driveUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white dark:bg-[#262626] hover:bg-zinc-100 dark:hover:bg-[#333333] text-sky-600 dark:text-sky-400 border border-zinc-200 dark:border-transparent flex items-center justify-center transition-all shadow-2xs" title="Abrir documento de este préstamo en Google Drive"><HardDrive className="w-4 h-4" /></a> : <button disabled className="w-8 h-8 rounded-lg bg-white dark:bg-[#262626] text-zinc-300 dark:text-zinc-600 border border-zinc-200 dark:border-transparent flex items-center justify-center" title="Este préstamo todavía no tiene un enlace de Drive"><HardDrive className="w-4 h-4" /></button>}

            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white dark:bg-[#262626] hover:bg-zinc-100 dark:hover:bg-[#333333] text-zinc-500 hover:text-zinc-900 dark:text-[#a3a3a3] dark:hover:text-white border border-zinc-200 dark:border-transparent flex items-center justify-center transition-all shadow-2xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CUERPO DEL EXPEDIENTE DETALLADO */}
        <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-4 bg-[#f7f7f8] dark:bg-[#1e1e1e] transition-colors duration-150">
          
          {/* ESTADO FINANCIERO Y CONTROL DE CAPITAL */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#262626] border border-zinc-200 dark:border-[#333333] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-[#8e8e8e] uppercase tracking-wider block">
                Auditoría de Capital
              </span>
              <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">
                Amortizado: {porcentajeAmortizado}%
              </span>
            </div>

            {/* Barra de Progreso de Amortización */}
            <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-[#1c1c1c] overflow-hidden">
              <div 
                className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${porcentajeAmortizado}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 dark:text-[#8e8e8e] block">Saldo Insoluto:</span>
                <strong className="text-base font-bold font-mono text-zinc-900 dark:text-white block">
                  {symbol} {saldoCapitalActual.toLocaleString()}
                </strong>
                <span className="text-[10px] text-zinc-400 dark:text-[#737373]">
                  Inicial: {symbol} {capitalOriginal.toLocaleString()}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 dark:text-[#8e8e8e] block">Próxima Cuota:</span>
                <strong className="text-base font-bold font-mono text-zinc-900 dark:text-white block">
                  {symbol} {cuotaProxima?.total ? Number(cuotaProxima.total).toLocaleString() : '0'}
                </strong>
                <span className="text-[10px] text-zinc-400 dark:text-[#737373]">
                  {cuotasPagadas} de {cronograma.length} saldadas
                </span>
              </div>
            </div>

            {/* Botón Destacado: Abono Extraordinario a Capital */}
            <button
              onClick={() => onOpenCapitalPayment && onOpenCapitalPayment(loan)}
              className="w-full py-2 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#303030] dark:hover:bg-[#383838] text-zinc-800 dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-zinc-200 dark:border-[#404040] shadow-xs active:scale-[0.99]"
            >
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Registrar Abono Extraordinario a Capital</span>
            </button>
          </div>

          {/* ACCIONES DE AUDITORÍA Y CONTROL (VAUCHERS, NOTAS EXPRESS, WHATSAPP) */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onOpenVouchers && onOpenVouchers(loan)}
              className="p-2.5 rounded-xl bg-white dark:bg-[#262626] hover:bg-zinc-50 dark:hover:bg-[#2e2e2e] border border-zinc-200 dark:border-[#333333] flex flex-col items-center justify-center gap-1.5 text-center transition-all group shadow-xs"
            >
              <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold text-zinc-900 dark:text-white leading-tight">Bauchers QR</span>
              <span className="text-[10px] text-zinc-500 dark:text-[#8e8e8e]">Comprobantes</span>
            </button>

            <button
              onClick={() => onOpenExpressNotes && onOpenExpressNotes(loan)}
              className="p-2.5 rounded-xl bg-white dark:bg-[#262626] hover:bg-zinc-50 dark:hover:bg-[#2e2e2e] border border-zinc-200 dark:border-[#333333] flex flex-col items-center justify-center gap-1.5 text-center transition-all group relative shadow-xs"
            >
              <MessageSquare className="w-4 h-4 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold text-zinc-900 dark:text-white leading-tight">Notas Express</span>
              <span className="text-[10px] text-zinc-500 dark:text-[#8e8e8e]">
                {notasExpressCount > 0 ? `${notasExpressCount} notas` : 'Bitácora'}
              </span>
            </button>

            <button
              onClick={() => onSendWhatsApp && onSendWhatsApp(loan, cuotaProxima)}
              className="p-2.5 rounded-xl bg-white dark:bg-[#262626] hover:bg-zinc-50 dark:hover:bg-[#2e2e2e] border border-zinc-200 dark:border-[#333333] flex flex-col items-center justify-center gap-1.5 text-center transition-all group shadow-xs"
            >
              <Send className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold text-zinc-900 dark:text-white leading-tight">WhatsApp</span>
              <span className="text-[10px] text-zinc-500 dark:text-[#8e8e8e]">Aviso Cobro</span>
            </button>
          </div>

          {/* BOTÓN PRIMARIO DE COBRO DE CUOTA */}
          {cuotaProxima && !cuotaProxima.pagado && (
            <button
              onClick={() => onPayCuota(loan, cuotaProxima)}
              className="w-full py-2.5 px-3.5 rounded-lg bg-zinc-900 hover:bg-black text-white dark:bg-[#f3f3f3] dark:hover:bg-white dark:text-[#171717] font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99]"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Marcar Cuota Pagada ({symbol} {cuotaProxima.total})</span>
            </button>
          )}

          {/* DETALLES DEL EXPEDIENTE */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#262626] border border-zinc-200 dark:border-[#333333] space-y-2 text-xs shadow-xs">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-[#8e8e8e] uppercase tracking-wider block">
              Datos Registrados
            </span>
            
            <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-[#303030]">
              <span className="text-zinc-500 dark:text-[#a3a3a3]">Fecha Inicio:</span>
              <span className="font-mono text-zinc-900 dark:text-white font-medium">{loan.inicio || 'No registrada'}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-[#303030]">
              <span className="text-zinc-500 dark:text-[#a3a3a3]">Fecha Vencimiento:</span>
              <span className="font-mono text-zinc-900 dark:text-white font-semibold">{loan.fin || 'Sin límite'}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-[#303030]">
              <span className="text-zinc-500 dark:text-[#a3a3a3]">Teléfono / Contacto:</span>
              <span className="font-mono text-zinc-900 dark:text-white">{loan.telefono || 'Sin teléfono'}</span>
            </div>

            {loan.garantia && (
              <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-[#303030]">
                <span className="text-zinc-500 dark:text-[#a3a3a3]">Garantía:</span>
                <span className="text-zinc-900 dark:text-white font-medium">{loan.garantia}</span>
              </div>
            )}

            {loan.notas && (
              <div className="pt-1">
                <span className="text-[11px] text-zinc-500 dark:text-[#8e8e8e] block mb-1">Cláusulas / Observaciones:</span>
                <div className="p-2 rounded-lg bg-zinc-50 dark:bg-[#1c1c1c] text-xs text-zinc-700 dark:text-[#d4d4d4] leading-relaxed whitespace-pre-wrap font-mono border border-zinc-200 dark:border-[#2d2d2d]">
                  {loan.notas}
                </div>
              </div>
            )}
          </div>

          {/* CRONOGRAMA DE CUOTAS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-[#8e8e8e] uppercase tracking-wider block">
                Cuotas Programadas ({cronograma.length})
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-[#737373]">
                {cuotasPagadas} pagadas
              </span>
            </div>

            <div className="space-y-1.5">
              {cronograma.map((c) => (
                <div 
                  key={c.key}
                  className={`p-3 rounded-lg flex items-center justify-between text-xs transition-all ${
                    c.pagado 
                      ? 'bg-zinc-100 dark:bg-[#232323] border border-zinc-200 dark:border-[#2d2d2d] text-zinc-400 dark:text-[#a3a3a3]' 
                      : 'bg-white dark:bg-[#262626] border border-zinc-200 dark:border-[#383838] text-zinc-900 dark:text-white shadow-2xs'
                  }`}
                >
                  <div>
                    <span className="font-medium block text-zinc-900 dark:text-white">{c.label}</span>
                    <span className="text-[11px] text-zinc-500 dark:text-[#8e8e8e] font-mono">{c.fechaVencimiento}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-zinc-900 dark:text-white">
                      {symbol} {c.total.toLocaleString()}
                    </span>
                    {c.pagado ? (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-transparent px-2 py-0.5 rounded font-medium">
                        Pagado
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onPayCuota(loan, c)}
                          className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-black text-white dark:bg-[#333333] dark:hover:bg-[#404040] text-xs font-medium transition-all shadow-2xs"
                        >
                          Abonar
                        </button>
                        <button
                          onClick={() => onOpenReceipt && onOpenReceipt(loan, c)}
                          className="p-1 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-[#2a2a2a] dark:hover:bg-[#333] text-zinc-600 dark:text-[#a3a3a3] hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-transparent"
                          title="Ver Recibo"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
