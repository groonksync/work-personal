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

  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';
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

  const notasExpressCount = (loan.notas_express || []).length;
  const esFondeoRodo = loan.id === 'acreedor-tio-rodo' || loan.notas?.includes('TIO RODO');
  const esAcreedor = loan.tipo_prestamo === 'recibido';
  const driveUrl = loan.drive_url || defaultDriveUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end bg-black/60 md:bg-transparent backdrop-blur-xs md:backdrop-blur-none animate-in fade-in duration-200">
      
      {/* Fondo clickeable para cerrar en móvil */}
      <div className="absolute inset-0 md:hidden" onClick={onClose}></div>

      {/* CONTENEDOR: BOTTOM SHEET EN MÓVIL / SIDE DRAWER EN DESKTOP */}
      <div className="relative w-full md:w-[460px] max-h-[92vh] md:max-h-full h-auto md:h-full bg-[#1e1e1e] rounded-t-3xl md:rounded-none border-t md:border-t-0 md:border-l border-[#2e2e2e] shadow-2xl flex flex-col text-[#ececec] animate-in slide-in-from-bottom md:slide-in-from-right duration-200 pb-[env(safe-area-inset-bottom,16px)] md:pb-0 z-10">
        
        {/* Tirador para deslizar en móvil */}
        <div className="w-12 h-1 rounded-full bg-[#444444] mx-auto mt-2.5 md:hidden shrink-0"></div>

        {/* HEADER DEL INSPECTOR (ESTILO CHATGPT, SVG PLANO) */}
        <div className="p-4 border-b border-[#2e2e2e] flex items-center justify-between bg-[#191919] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#262626] border border-[#383838] flex items-center justify-center text-white">
              {esAcreedor ? (
                <Landmark className="w-4 h-4 text-purple-400" />
              ) : (
                <User className="w-4 h-4 text-[#d4d4d4]" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight leading-none">
                {loan.nombre}
              </h3>
              <span className="text-xs text-[#a3a3a3] font-medium block mt-1">
                {esAcreedor ? 'Acreedor de Capital' : `Prestatario • CI: ${loan.ci || 'Sin registro'}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón directo a Google Drive */}
            <a
              href={driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-[#262626] hover:bg-[#333333] text-sky-400 flex items-center justify-center transition-all"
              title="Abrir carpeta en Google Drive"
            >
              <HardDrive className="w-4 h-4" />
            </a>

            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#262626] hover:bg-[#333333] text-[#a3a3a3] hover:text-white flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CUERPO DEL EXPEDIENTE DETALLADO */}
        <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-4 bg-[#1e1e1e]">
          
          {/* ESTRUCTURA DE FONDEO (TONOS GRISES LIMPIOS) */}
          {esFondeoRodo && (
            <div className="p-4 rounded-xl bg-[#262626] border border-[#383838] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Estructura de Fondeo</span>
                </span>
                <span className="text-[11px] bg-[#333333] text-[#d4d4d4] px-2 py-0.5 rounded font-mono font-medium">
                  3% Tasa Pasiva
                </span>
              </div>
              
              <p className="text-xs text-[#b4b4b4] leading-relaxed">
                Capital fondeado por <strong>Tío Rodo</strong> (Bs. 10,000) colocado a <strong>Magali Molina</strong> (Bs. 15,000 @ 10%).
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-lg bg-[#1e1e1e] border border-[#333333]">
                  <span className="text-[11px] text-[#8e8e8e] block">Cobras a Magali:</span>
                  <strong className="text-white text-sm font-mono block mt-0.5">Bs. 1,500/m</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-[#1e1e1e] border border-[#333333]">
                  <span className="text-[11px] text-[#8e8e8e] block">Pagas a Tío Rodo:</span>
                  <strong className="text-[#e5e5e5] text-sm font-mono block mt-0.5">Bs. 300/m</strong>
                </div>
              </div>

              <div className="text-xs font-semibold text-emerald-400 flex items-center justify-between pt-1 border-t border-[#333333]">
                <span>Ganancia Neta Mensual:</span>
                <span className="font-mono text-sm font-bold">+Bs. 700.00 / mes</span>
              </div>
            </div>
          )}

          {/* ESTADO FINANCIERO Y CONTROL DE CAPITAL */}
          <div className="p-3.5 rounded-xl bg-[#262626] border border-[#333333] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-wider block">
                Auditoría de Capital
              </span>
              <span className="text-xs font-mono font-medium text-emerald-400">
                Amortizado: {porcentajeAmortizado}%
              </span>
            </div>

            {/* Barra de Progreso de Amortización */}
            <div className="w-full h-1.5 rounded-full bg-[#1c1c1c] overflow-hidden">
              <div 
                className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${porcentajeAmortizado}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div>
                <span className="text-[10px] text-[#8e8e8e] block">Saldo Insoluto:</span>
                <strong className="text-base font-bold font-mono text-white block">
                  {symbol} {saldoCapitalActual.toLocaleString()}
                </strong>
                <span className="text-[10px] text-[#737373]">
                  Inicial: {symbol} {capitalOriginal.toLocaleString()}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#8e8e8e] block">Próxima Cuota:</span>
                <strong className="text-base font-bold font-mono text-white block">
                  {symbol} {cuotaProxima?.total ? Number(cuotaProxima.total).toLocaleString() : '0'}
                </strong>
                <span className="text-[10px] text-[#737373]">
                  {cuotasPagadas} de {cronograma.length} saldadas
                </span>
              </div>
            </div>

            {/* Botón Destacado: Abono Extraordinario a Capital */}
            <button
              onClick={() => onOpenCapitalPayment && onOpenCapitalPayment(loan)}
              className="w-full py-2 px-3 rounded-lg bg-[#303030] hover:bg-[#383838] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-[#404040]"
            >
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>Registrar Abono Extraordinario a Capital</span>
            </button>
          </div>

          {/* ACCIONES DE AUDITORÍA Y CONTROL (VAUCHERS, NOTAS EXPRESS, WHATSAPP) */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onOpenVouchers && onOpenVouchers(loan)}
              className="p-2.5 rounded-xl bg-[#262626] hover:bg-[#2e2e2e] border border-[#333333] flex flex-col items-center justify-center gap-1.5 text-center transition-all group"
            >
              <Receipt className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold text-white leading-tight">Bauchers QR</span>
              <span className="text-[10px] text-[#8e8e8e]">Comprobantes</span>
            </button>

            <button
              onClick={() => onOpenExpressNotes && onOpenExpressNotes(loan)}
              className="p-2.5 rounded-xl bg-[#262626] hover:bg-[#2e2e2e] border border-[#333333] flex flex-col items-center justify-center gap-1.5 text-center transition-all group relative"
            >
              <MessageSquare className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold text-white leading-tight">Notas Express</span>
              <span className="text-[10px] text-[#8e8e8e]">
                {notasExpressCount > 0 ? `${notasExpressCount} notas` : 'Bitácora'}
              </span>
            </button>

            <button
              onClick={() => onSendWhatsApp && onSendWhatsApp(loan, cuotaProxima)}
              className="p-2.5 rounded-xl bg-[#262626] hover:bg-[#2e2e2e] border border-[#333333] flex flex-col items-center justify-center gap-1.5 text-center transition-all group"
            >
              <Send className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold text-white leading-tight">WhatsApp</span>
              <span className="text-[10px] text-[#8e8e8e]">Aviso Cobro</span>
            </button>
          </div>

          {/* BOTÓN PRIMARIO DE COBRO DE CUOTA */}
          {cuotaProxima && !cuotaProxima.pagado && (
            <button
              onClick={() => onPayCuota(loan, cuotaProxima)}
              className="w-full py-2.5 px-3.5 rounded-lg bg-[#f3f3f3] hover:bg-white text-[#171717] font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99]"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Marcar Cuota Pagada ({symbol} {cuotaProxima.total})</span>
            </button>
          )}

          {/* DETALLES DEL EXPEDIENTE */}
          <div className="p-3.5 rounded-xl bg-[#262626] border border-[#333333] space-y-2 text-xs">
            <span className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-wider block">
              Datos Registrados
            </span>
            
            <div className="flex justify-between items-center py-1 border-b border-[#303030]">
              <span className="text-[#a3a3a3]">Fecha Inicio:</span>
              <span className="font-mono text-white font-medium">{loan.inicio || 'No registrada'}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-[#303030]">
              <span className="text-[#a3a3a3]">Fecha Vencimiento:</span>
              <span className="font-mono text-white font-semibold">{loan.fin || 'Sin límite'}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-[#303030]">
              <span className="text-[#a3a3a3]">Teléfono / Contacto:</span>
              <span className="font-mono text-white">{loan.telefono || 'Sin teléfono'}</span>
            </div>

            {loan.garantia && (
              <div className="flex justify-between items-center py-1 border-b border-[#303030]">
                <span className="text-[#a3a3a3]">Garantía:</span>
                <span className="text-white font-medium">{loan.garantia}</span>
              </div>
            )}

            {loan.notas && (
              <div className="pt-1">
                <span className="text-[11px] text-[#8e8e8e] block mb-1">Cláusulas / Observaciones:</span>
                <div className="p-2 rounded-lg bg-[#1c1c1c] text-xs text-[#d4d4d4] leading-relaxed whitespace-pre-wrap font-mono border border-[#2d2d2d]">
                  {loan.notas}
                </div>
              </div>
            )}
          </div>

          {/* CRONOGRAMA DE CUOTAS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-wider block">
                Cuotas Programadas ({cronograma.length})
              </span>
              <span className="text-[10px] text-[#737373]">
                {cuotasPagadas} pagadas
              </span>
            </div>

            <div className="space-y-1.5">
              {cronograma.map((c) => (
                <div 
                  key={c.key}
                  className={`p-3 rounded-lg flex items-center justify-between text-xs transition-all ${
                    c.pagado 
                      ? 'bg-[#232323] border border-[#2d2d2d] text-[#a3a3a3]' 
                      : 'bg-[#262626] border border-[#383838] text-white'
                  }`}
                >
                  <div>
                    <span className="font-medium block text-white">{c.label}</span>
                    <span className="text-[11px] text-[#8e8e8e] font-mono">{c.fechaVencimiento}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-white">
                      {symbol} {c.total.toLocaleString()}
                    </span>
                    {c.pagado ? (
                      <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-medium">
                        Pagado
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onPayCuota(loan, c)}
                          className="px-2.5 py-1 rounded bg-[#333333] hover:bg-[#404040] text-xs text-white font-medium transition-all"
                        >
                          Abonar
                        </button>
                        <button
                          onClick={() => onOpenReceipt && onOpenReceipt(loan, c)}
                          className="p-1 rounded bg-[#2a2a2a] hover:bg-[#333] text-[#a3a3a3] hover:text-white"
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
