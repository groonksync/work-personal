import React, { useState } from 'react';
import { 
  X, Check, Send, Receipt, Phone, User, Calendar, 
  DollarSign, TrendingUp, TrendingDown, AlertCircle, Shield, FileText, 
  ExternalLink, ChevronRight, Zap, Landmark, MessageSquare, 
  HardDrive, PlusCircle, Clock, Edit3, Save
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
  onOpenExtension,
  onOpenVouchers,
  onOpenExpressNotes,
  onUpdateLoan,
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
  const currentDriveUrl = loan.drive_url || loan.drive_contrato || defaultDriveUrl;

  const [editingDrive, setEditingDrive] = useState(false);
  const [driveInput, setDriveInput] = useState(loan.drive_url || loan.drive_contrato || '');

  const handleSaveDriveUrl = () => {
    if (onUpdateLoan) {
      onUpdateLoan({
        ...loan,
        drive_url: driveInput.trim(),
        drive_contrato: driveInput.trim(),
      });
    }
    setEditingDrive(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Fondo clickeable para cerrar en móvil */}
      <div className="absolute inset-0 md:hidden" onClick={onClose}></div>

      {/* CONTENEDOR: BOTTOM SHEET EN MÓVIL / SIDE DRAWER EN DESKTOP */}
      <div className="relative w-full md:w-[460px] max-h-[92vh] md:max-h-full h-auto md:h-full bg-[#151619] rounded-t-3xl md:rounded-none border-t md:border-t-0 md:border-l border-[#222327] shadow-2xl flex flex-col text-white animate-in slide-in-from-bottom md:slide-in-from-right duration-200 pb-[env(safe-area-inset-bottom,16px)] md:pb-0 z-10 transition-colors duration-150">
        
        {/* Tirador para deslizar en móvil */}
        <div className="w-12 h-1 rounded-full bg-[#26282e] mx-auto mt-2.5 md:hidden shrink-0"></div>

        {/* HEADER DEL INSPECTOR */}
        <div className="p-4 border-b border-[#222327] flex items-center justify-between bg-[#111215] shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-[#1b1c20] border border-[#26282e] flex items-center justify-center text-white shrink-0">
              {esAcreedor ? (
                <Landmark className="w-4 h-4 text-purple-400" />
              ) : (
                <User className="w-4 h-4 text-zinc-300" />
              )}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-base font-bold text-white tracking-tight leading-none truncate">
                {loan.nombre}
              </h3>
              <span className="text-xs text-zinc-400 font-medium block mt-1 truncate">
                {esAcreedor ? 'Acreedor de Capital' : `Prestatario • CI: ${loan.ci || 'Sin registro'}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Botón directo a Google Drive */}
            <a
              href={currentDriveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-[#1b1c20] hover:bg-[#222329] text-[#3b82f6] border border-[#26282e] flex items-center justify-center transition-all shadow-xs"
              title="Abrir carpeta en Google Drive"
            >
              <HardDrive className="w-4 h-4" />
            </a>

            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#1b1c20] hover:bg-[#222329] text-zinc-400 hover:text-white border border-[#26282e] flex items-center justify-center transition-all shadow-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CUERPO DEL EXPEDIENTE DETALLADO */}
        <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-4 bg-[#0c0d10] transition-colors duration-150">
          
          {/* ESTRUCTURA DE FONDEO (SI APLICA) */}
          {esFondeoRodo && (
            <div className="p-4 rounded-xl bg-[#151619] border border-[#222327] space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Estructura de Fondeo</span>
                </span>
                <span className="text-[11px] bg-[#1b1c20] text-zinc-300 border border-[#26282e] px-2 py-0.5 rounded font-mono font-medium">
                  3% Tasa Pasiva
                </span>
              </div>
              
              <p className="text-xs text-zinc-400 leading-relaxed">
                Capital fondeado por <strong>Tío Rodo</strong> (Bs. 10,000) colocado a <strong>Magali Molina</strong> (Bs. 15,000 @ 10%).
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-lg bg-[#1b1c20] border border-[#26282e]">
                  <span className="text-[11px] text-zinc-400 block">Cobras a Magali:</span>
                  <strong className="text-white text-sm font-mono block mt-0.5">Bs. 1,500/m</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-[#1b1c20] border border-[#26282e]">
                  <span className="text-[11px] text-zinc-400 block">Pagas a Tío Rodo:</span>
                  <strong className="text-zinc-200 text-sm font-mono block mt-0.5">Bs. 300/m</strong>
                </div>
              </div>

              <div className="text-xs font-semibold text-emerald-400 flex items-center justify-between pt-1 border-t border-[#222327]">
                <span>Ganancia Neta Mensual:</span>
                <span className="font-mono text-sm font-bold">+Bs. 700.00 / mes</span>
              </div>
            </div>
          )}

          {/* ESTADO FINANCIERO Y CONTROL DE CAPITAL */}
          <div className="p-3.5 rounded-xl bg-[#151619] border border-[#222327] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Auditoría de Capital
              </span>
              <span className="text-xs font-mono font-medium text-emerald-400">
                Amortizado: {porcentajeAmortizado}%
              </span>
            </div>

            {/* Barra de Progreso de Amortización */}
            <div className="w-full h-1.5 rounded-full bg-[#1b1c20] border border-[#26282e] overflow-hidden">
              <div 
                className="h-full bg-[#2563eb] rounded-full transition-all duration-300"
                style={{ width: `${porcentajeAmortizado}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 block">Saldo Insoluto:</span>
                <strong className="text-base font-bold font-mono text-white block">
                  {symbol} {saldoCapitalActual.toLocaleString()}
                </strong>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Inicial: {symbol} {capitalOriginal.toLocaleString()}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 block">Próxima Cuota:</span>
                <strong className="text-base font-bold font-mono text-white block">
                  {symbol} {cuotaProxima?.total ? Number(cuotaProxima.total).toLocaleString() : '0'}
                </strong>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {cuotasPagadas} de {cronograma.length} saldadas
                </span>
              </div>
            </div>

            {/* DÚO DE ACCIONES FINANCIERAS CLAVE: ABONO A CAPITAL + PRÓRROGA */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onOpenCapitalPayment && onOpenCapitalPayment(loan)}
                className="py-2 px-2.5 rounded-lg bg-[#1b1c20] hover:bg-[#222329] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-[#26282e] shadow-xs active:scale-[0.99]"
              >
                <TrendingDown className="w-3.5 h-3.5 text-[#3b82f6] shrink-0" />
                <span className="truncate">Abono a Capital</span>
              </button>

              <button
                onClick={() => onOpenExtension && onOpenExtension(loan)}
                className="py-2 px-2.5 rounded-lg bg-[#1b1c20] hover:bg-[#222329] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-[#26282e] shadow-xs active:scale-[0.99]"
              >
                <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="truncate">Extender Plazo</span>
              </button>
            </div>
          </div>

          {/* ACCIONES DE AUDITORÍA Y CONTROL (VAUCHERS, NOTAS EXPRESS, WHATSAPP) */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onOpenVouchers && onOpenVouchers(loan)}
              className="p-2.5 rounded-xl bg-[#151619] hover:bg-[#1b1c20] border border-[#222327] flex flex-col items-center justify-center gap-1.5 text-center transition-all group shadow-xs"
            >
              <Receipt className="w-4 h-4 text-[#3b82f6] group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold text-white leading-tight">Bauchers QR</span>
              <span className="text-[10px] text-zinc-400">Comprobantes</span>
            </button>

            <button
              onClick={() => onOpenExpressNotes && onOpenExpressNotes(loan)}
              className="p-2.5 rounded-xl bg-[#151619] hover:bg-[#1b1c20] border border-[#222327] flex flex-col items-center justify-center gap-1.5 text-center transition-all group relative shadow-xs"
            >
              <MessageSquare className="w-4 h-4 text-[#3b82f6] group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold text-white leading-tight">Notas Express</span>
              <span className="text-[10px] text-zinc-400">
                {notasExpressCount > 0 ? `${notasExpressCount} notas` : 'Bitácora'}
              </span>
            </button>

            <button
              onClick={() => onSendWhatsApp && onSendWhatsApp(loan, cuotaProxima)}
              className="p-2.5 rounded-xl bg-[#151619] hover:bg-[#1b1c20] border border-[#222327] flex flex-col items-center justify-center gap-1.5 text-center transition-all group shadow-xs"
            >
              <Send className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold text-white leading-tight">WhatsApp</span>
              <span className="text-[10px] text-zinc-400">Aviso Cobro</span>
            </button>
          </div>

          {/* INTEGRACIÓN DE GOOGLE DRIVE PARA EL EXPEDIENTE */}
          <div className="p-3.5 rounded-xl bg-[#151619] border border-[#222327] space-y-2.5 text-xs shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#3b82f6] flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" />
                <span>Documentos en Google Drive</span>
              </span>
              <button
                onClick={() => setEditingDrive(!editingDrive)}
                className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>{editingDrive ? 'Cancelar' : 'Editar Enlace'}</span>
              </button>
            </div>

            {editingDrive ? (
              <div className="space-y-2">
                <input
                  type="url"
                  value={driveInput}
                  onChange={(e) => setDriveInput(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full bg-[#1b1c20] border border-[#26282e] px-3 py-1.5 rounded-lg text-xs font-mono text-white outline-none focus:border-[#2563eb]"
                />
                <button
                  onClick={handleSaveDriveUrl}
                  className="px-3 py-1.5 rounded-lg bg-[#2563eb] text-white text-xs font-semibold flex items-center gap-1 shadow-xs active:scale-[0.98]"
                >
                  <Save className="w-3 h-3" />
                  <span>Guardar Enlace</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <a
                  href={currentDriveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 px-3 rounded-lg bg-[#1b1c20] hover:bg-[#202126] text-[#3b82f6] border border-[#26282e] flex items-center justify-between text-xs font-medium transition-all truncate"
                >
                  <span className="truncate">{loan.drive_url || loan.drive_contrato ? 'Carpeta Asignada' : 'Abrir Google Drive General'}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1.5" />
                </a>
              </div>
            )}
          </div>

          {/* BOTÓN PRIMARIO DE COBRO DE CUOTA */}
          {cuotaProxima && !cuotaProxima.pagado && (
            <button
              onClick={() => onPayCuota(loan, cuotaProxima)}
              className="w-full py-2.5 px-3.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99]"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Marcar Cuota Pagada ({symbol} {cuotaProxima.total})</span>
            </button>
          )}

          {/* DETALLES DEL EXPEDIENTE */}
          <div className="p-3.5 rounded-xl bg-[#151619] border border-[#222327] space-y-2 text-xs shadow-xs">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Datos Registrados
            </span>
            
            <div className="flex justify-between items-center py-1 border-b border-[#222327]">
              <span className="text-zinc-400">Modalidad de Cobro:</span>
              <span className="font-semibold text-white capitalize">
                {loan.tipo_pago === 'diario' ? 'Cobro Diario' : 'Cobro Mensual'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-[#222327]">
              <span className="text-zinc-400">Fecha Inicio:</span>
              <span className="font-mono text-white font-medium">{loan.inicio || 'No registrada'}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-[#222327]">
              <span className="text-zinc-400">Fecha Vencimiento:</span>
              <span className="font-mono text-white font-semibold">{loan.fin || 'Sin límite'}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-[#222327]">
              <span className="text-zinc-400">Teléfono / Contacto:</span>
              <span className="font-mono text-white">{loan.telefono || 'Sin teléfono'}</span>
            </div>

            {loan.garantia && (
              <div className="flex justify-between items-center py-1 border-b border-[#222327]">
                <span className="text-zinc-400">Garantía:</span>
                <span className="text-white font-medium">{loan.garantia}</span>
              </div>
            )}

            {loan.notas && (
              <div className="pt-1">
                <span className="text-[11px] text-zinc-400 block mb-1">Cláusulas / Observaciones:</span>
                <div className="p-2 rounded-lg bg-[#1b1c20] text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap font-mono border border-[#26282e]">
                  {loan.notas}
                </div>
              </div>
            )}
          </div>

          {/* CRONOGRAMA DE CUOTAS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Cuotas Programadas ({cronograma.length})
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {cuotasPagadas} pagadas
              </span>
            </div>

            <div className="space-y-1.5">
              {cronograma.map((c) => (
                <div 
                  key={c.key}
                  className={`p-3 rounded-xl flex items-center justify-between text-xs transition-all border ${
                    c.pagado 
                      ? 'bg-[#16171a] border-[#1e1f23] text-zinc-400' 
                      : 'bg-[#1b1c20] border-[#222327] text-white shadow-2xs'
                  }`}
                >
                  <div>
                    <span className="font-medium block text-white">{c.label}</span>
                    <span className="text-[11px] text-zinc-400 font-mono">{c.fechaVencimiento}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-white">
                      {symbol} {c.total.toLocaleString()}
                    </span>
                    {c.pagado ? (
                      <span className="text-[11px] text-emerald-400 bg-[#16271c] border border-emerald-900/40 px-2 py-0.5 rounded font-medium">
                        Pagado
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onPayCuota(loan, c)}
                          className="px-2.5 py-1 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium transition-all shadow-xs"
                        >
                          Abonar
                        </button>
                        <button
                          onClick={() => onOpenReceipt && onOpenReceipt({ nombre: loan.nombre, ci: loan.ci }, loan, c)}
                          className="p-1 rounded-lg bg-[#1f2025] hover:bg-[#282a32] text-zinc-400 hover:text-white border border-[#26282e]"
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
