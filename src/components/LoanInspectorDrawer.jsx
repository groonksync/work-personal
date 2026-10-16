import React from 'react';
import { 
  X, Check, Send, Receipt, Phone, User, Calendar, 
  DollarSign, TrendingUp, AlertCircle, Shield, FileText, 
  ExternalLink, ChevronRight, Zap
} from 'lucide-react';
import { generarCronograma } from '../lib/amortizacion';

export default function LoanInspectorDrawer({
  loan,
  onClose,
  currency = 'BOB',
  onPayCuota,
  onOpenReceipt,
  onSendWhatsApp,
}) {
  if (!loan) return null;

  const symbol = currency === 'BOB' ? 'Bs.' : currency === 'PEN' ? 'S/' : '$';
  const cronograma = generarCronograma(loan);
  const cuotasPagadas = cronograma.filter(c => c.pagado).length;
  const cuotaProxima = cronograma.find(c => !c.pagado) || cronograma[cronograma.length - 1];

  const esFondeoRodo = loan.id === 'acreedor-tio-rodo' || loan.notas?.includes('TIO RODO');
  const esAcreedor = loan.tipo_prestamo === 'recibido';

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end bg-black/60 md:bg-transparent backdrop-blur-xs md:backdrop-blur-none animate-in fade-in duration-200">
      
      {/* Fondo clickeable para cerrar en móvil */}
      <div className="absolute inset-0 md:hidden" onClick={onClose}></div>

      {/* CONTENEDOR: BOTTOM SHEET EN MÓVIL / SIDE DRAWER EN DESKTOP */}
      <div className="relative w-full md:w-[440px] max-h-[90vh] md:max-h-full h-auto md:h-full bg-[#1e1e1e] rounded-t-3xl md:rounded-none border-t md:border-t-0 md:border-l border-[#2e2e2e] shadow-2xl flex flex-col text-[#ececec] animate-in slide-in-from-bottom md:slide-in-from-right duration-200 pb-[env(safe-area-inset-bottom,16px)] md:pb-0 z-10">
        
        {/* Tirador para deslizar en móvil */}
        <div className="w-12 h-1 rounded-full bg-[#444444] mx-auto mt-2.5 md:hidden shrink-0"></div>

        {/* HEADER DEL INSPECTOR (ESTILO CHATGPT) */}
        <div className="p-4 border-b border-[#2e2e2e] flex items-center justify-between bg-[#1e1e1e] shrink-0">

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#2a2a2a] border border-[#383838] flex items-center justify-center font-bold text-sm text-white">
            {esAcreedor ? '🏦' : '👤'}
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

        <button 
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-[#2a2a2a] hover:bg-[#333333] text-[#a3a3a3] hover:text-white flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* CUERPO DEL EXPEDIENTE DETALLADO */}
      <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-4 bg-[#1e1e1e]">
        
        {/* ESTRUCTURA DE FONDEO (TONOS GRISES LIMPIOS, CERO GLOBOS O COLORES CHILLONES) */}
        {esFondeoRodo && (
          <div className="p-4 rounded-xl bg-[#262626] border border-[#383838] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span>⚡</span> Estructura de Fondeo
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

        {/* NÚMEROS PRINCIPALES (GRANDES, CLAROS Y VISUALMENTE CÓMODOS) */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3.5 rounded-xl bg-[#262626] border border-[#333333]">
            <span className="text-[11px] text-[#8e8e8e] font-medium uppercase tracking-wider block">Capital</span>
            <div className="text-lg font-bold font-mono text-white mt-1">
              {symbol} {Number(loan.capital || 0).toLocaleString()}
            </div>
            <span className="text-xs text-[#a3a3a3] font-medium block mt-0.5">
              Tasa: {loan.interes}% {loan.tipo_pago || 'mensual'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#262626] border border-[#333333]">
            <span className="text-[11px] text-[#8e8e8e] font-medium uppercase tracking-wider block">Cuota Mensual</span>
            <div className="text-lg font-bold font-mono text-white mt-1">
              {symbol} {cuotaProxima?.total ? Number(cuotaProxima.total).toLocaleString() : '0'}
            </div>
            <span className="text-xs text-[#a3a3a3] block mt-0.5">
              {cuotasPagadas} de {cronograma.length} saldadas
            </span>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN SUAVES Y LISOS (ESTILO CHATGPT) */}
        <div className="space-y-2 pt-1">
          {cuotaProxima && !cuotaProxima.pagado && (
            <button
              onClick={() => onPayCuota(loan, cuotaProxima)}
              className="w-full py-2.5 px-3.5 rounded-lg bg-[#f3f3f3] hover:bg-white text-[#171717] font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99]"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Marcar Cuota Pagada ({symbol} {cuotaProxima.total})</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSendWhatsApp && onSendWhatsApp(loan, cuotaProxima)}
              className="py-2.5 px-3 rounded-lg bg-[#262626] hover:bg-[#303030] text-xs font-medium text-white flex items-center justify-center gap-2 transition-all border border-[#383838]"
            >
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              <span>Enviar WhatsApp</span>
            </button>

            <button
              onClick={() => onOpenReceipt && onOpenReceipt(loan, cuotaProxima)}
              className="py-2.5 px-3 rounded-lg bg-[#262626] hover:bg-[#303030] text-xs font-medium text-white flex items-center justify-center gap-2 transition-all border border-[#383838]"
            >
              <Receipt className="w-3.5 h-3.5 text-[#d4d4d4]" />
              <span>Ver Recibo</span>
            </button>
          </div>
        </div>

        {/* DETALLES DEL EXPEDIENTE */}
        <div className="p-3.5 rounded-xl bg-[#262626] border border-[#333333] space-y-2.5 text-xs">
          <span className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-wider block">
            Datos Registrados
          </span>
          
          <div className="flex justify-between items-center py-1.5 border-b border-[#303030]">
            <span className="text-[#a3a3a3]">Fecha Inicio:</span>
            <span className="font-mono text-white font-medium">{loan.inicio || 'No registrada'}</span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-[#303030]">
            <span className="text-[#a3a3a3]">Fecha Vencimiento:</span>
            <span className="font-mono text-white font-semibold">{loan.fin || 'Sin límite'}</span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-[#303030]">
            <span className="text-[#a3a3a3]">Teléfono / Contacto:</span>
            <span className="font-mono text-white">{loan.telefono || 'Sin teléfono'}</span>
          </div>

          {loan.garantia && (
            <div className="flex justify-between items-center py-1.5 border-b border-[#303030]">
              <span className="text-[#a3a3a3]">Garantía:</span>
              <span className="text-white font-medium">{loan.garantia}</span>
            </div>
          )}

          {loan.notas && (
            <div className="pt-1">
              <span className="text-[11px] text-[#8e8e8e] block mb-1">Notas y Cláusulas:</span>
              <div className="p-2.5 rounded-lg bg-[#1c1c1c] text-xs text-[#d4d4d4] leading-relaxed whitespace-pre-wrap font-mono border border-[#2d2d2d]">
                {loan.notas}
              </div>
            </div>
          )}
        </div>

        {/* CRONOGRAMA DE CUOTAS */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-[#8e8e8e] uppercase tracking-wider block px-1">
            Cuotas Programadas ({cronograma.length})
          </span>

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
                    <button
                      onClick={() => onPayCuota(loan, c)}
                      className="px-3 py-1 rounded bg-[#333333] hover:bg-[#404040] text-xs text-white font-medium transition-all"
                    >
                      Abonar
                    </button>
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
